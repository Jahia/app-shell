/*
 * ==========================================================================================
 * =                   JAHIA'S DUAL LICENSING - IMPORTANT INFORMATION                       =
 * ==========================================================================================
 *
 *                                 http://www.jahia.com
 *
 *     Copyright (C) 2002-2019 Jahia Solutions Group SA. All rights reserved.
 *
 *     THIS FILE IS AVAILABLE UNDER TWO DIFFERENT LICENSES:
 *     1/GPL OR 2/JSEL
 *
 *     1/ GPL
 *     ==================================================================================
 *
 *     IF YOU DECIDE TO CHOOSE THE GPL LICENSE, YOU MUST COMPLY WITH THE FOLLOWING TERMS:
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 *
 *     2/ JSEL - Commercial and Supported Versions of the program
 *     ===================================================================================
 *
 *     IF YOU DECIDE TO CHOOSE THE JSEL LICENSE, YOU MUST COMPLY WITH THE FOLLOWING TERMS:
 *
 *     Alternatively, commercial and supported versions of the program - also known as
 *     Enterprise Distributions - must be used in accordance with the terms and conditions
 *     contained in a separate written agreement between you and Jahia Solutions Group SA.
 *
 *     If you are unsure which license is appropriate for your use,
 *     please contact the sales department at sales@jahia.com.
 */
package org.jahia.modules.appshell;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.jahia.bin.Jahia;
import org.jahia.osgi.BundleState;
import org.jahia.osgi.BundleUtils;
import org.jahia.osgi.FrameworkService;
import org.jahia.registries.ServicesRegistry;
import org.jahia.services.content.JCRSessionFactory;
import org.jahia.services.usermanager.JahiaUser;
import org.jahia.services.usermanager.JahiaUserManagerService;
import org.jahia.settings.SettingsBean;
import org.json.JSONException;
import org.json.JSONObject;
import org.osgi.framework.Bundle;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

@Component(service = {javax.servlet.http.HttpServlet.class, javax.servlet.Servlet.class}, property = {"alias=/appshell", "osgi.http.whiteboard.servlet.asyncSupported=true"})
public class Main extends HttpServlet {
    private static final String PACKAGE_JSON = "javascript/apps/package.json";
    private static final String JAHIA_JSON = "javascript/apps/jahia.json";
    private static final String JAHIA = "jahia";
    private static final String APPS = "apps";
    private static Logger logger = LoggerFactory.getLogger(Main.class);

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            int slashIndex = request.getPathInfo().indexOf('/', 1);
            String appName = slashIndex == -1 ? request.getPathInfo().substring(1) : request.getPathInfo().substring(1, slashIndex);

            JahiaUser currentUser = JCRSessionFactory.getInstance().getCurrentUser();
            if (JahiaUserManagerService.isGuest(currentUser)) {
                response.sendRedirect(Jahia.getContextPath() + "/cms/login?redirect=" + response.encodeRedirectURL(request.getRequestURI()));
                return;
            }

            HttpServletRequestWrapper wrapper = new HttpServletRequestWrapper(request) {
                @Override
                public String getContextPath() {
                    return Jahia.getContextPath();
                }
            };
            wrapper.setAttribute("defaultSite", ServicesRegistry.getInstance().getJahiaSitesService().getDefaultSite());
            wrapper.setAttribute("appName", appName);
            setCustomAttributes(currentUser, wrapper);

            List<String> scripts = getApplicationScripts(appName);
            wrapper.setAttribute("scripts", "[" + StringUtils.join(scripts, ",") + "]");

            response.setHeader("Cache-Control", "no-store");
            wrapper.getRequestDispatcher("/modules/app-shell/root.jsp").include(wrapper, response);
        } catch (Exception e) {
            logger.error("Error while dispatching: {}", e.getMessage(), e);
        }
    }

    private void setCustomAttributes(JahiaUser currentUser, HttpServletRequestWrapper wrapper) throws JSONException {
        wrapper.setAttribute("contextPath", Jahia.getContextPath());
        wrapper.setAttribute("currentUser", currentUser);

        SettingsBean settingsBean = SettingsBean.getInstance();

        JSONObject config = new JSONObject();
        config.put("environment", settingsBean.getString("jahia.environment", ""));
        config.put("maxUploadSize", settingsBean.getJahiaFileUploadMaxSize() / (1024 * 1024));
        config.put("displayWorkflowCounter", settingsBean.getString("jahia.ui.displayWorkflowCounter", "true"));
        config.put("operatingMode", settingsBean.getOperatingMode());

        JSONObject links = new JSONObject();
        links.put("documentation", settingsBean.getString("documentation.link", "https://academy.jahia.com/documentation/"));
        boolean isWhatsNewDisplayable = Boolean.parseBoolean(settingsBean.getString("whatsNew.display", "true"));
        if (isWhatsNewDisplayable) {
            links.put("whatsNew", settingsBean.getString("whatsNew.link", ""));
        } else {
            links.put("whatsNew", "https://academy.jahia.com/whats-new");
        }
        config.put("links", links);

        wrapper.setAttribute("config", config.toString());
    }


    public List<String> getApplicationScripts(String appName) throws JSONException, IOException {
        LinkedList<String> resources = new LinkedList<>();

        for (Bundle bundle : getPackages()) {
            String jsBundle = getBundleScript(bundle, appName);
            if (jsBundle != null) {
                resources.addFirst("\"" + jsBundle + "\"");
            }
        }
        return resources;
    }

    private List<Bundle> getPackages() {
        return Arrays.stream(FrameworkService.getBundleContext().getBundles()).filter(bundle -> bundle.getState() == BundleState.ACTIVE.toInt() && BundleUtils.isJahiaModuleBundle(bundle) && (bundle.getResource(PACKAGE_JSON) != null || bundle.getResource(JAHIA_JSON) != null)).collect(Collectors.toList());
    }

    private String getBundleScript(Bundle bundle, String appName) throws IOException, JSONException {
        JSONObject pkgJson = new JSONObject(IOUtils.toString(bundle.getResource(PACKAGE_JSON) != null ? bundle.getResource(PACKAGE_JSON) : bundle.getResource(JAHIA_JSON)));
        boolean hasExtend = pkgJson.has(JAHIA) && pkgJson.getJSONObject(JAHIA).has(APPS) && pkgJson.getJSONObject(JAHIA).getJSONObject(APPS).has(appName);
        if (hasExtend) {
            return "/modules/" + bundle.getSymbolicName() + "/" + pkgJson.getJSONObject(JAHIA).getJSONObject(APPS).getString(appName);
        }
        return null;
    }

}
