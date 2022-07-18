/*
 * MIT License
 *
 * Copyright (c) 2002 - 2022 Jahia Solutions Group. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
package org.jahia.modules.appshell;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang3.LocaleUtils;
import org.jahia.bin.Jahia;
import org.jahia.exceptions.JahiaException;
import org.jahia.osgi.BundleState;
import org.jahia.osgi.BundleUtils;
import org.jahia.osgi.FrameworkService;
import org.jahia.registries.ServicesRegistry;
import org.jahia.services.content.*;
import org.jahia.services.content.decorator.JCRSiteNode;
import org.jahia.services.content.decorator.JCRUserNode;
import org.jahia.services.sites.JahiaSite;
import org.jahia.services.usermanager.JahiaGroupManagerService;
import org.jahia.services.usermanager.JahiaUser;
import org.jahia.services.usermanager.JahiaUserManagerService;
import org.jahia.settings.SettingsBean;
import org.jahia.utils.Url;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleEvent;
import org.osgi.framework.BundleListener;
import org.osgi.service.component.ComponentContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Component(service = {javax.servlet.http.HttpServlet.class, javax.servlet.Servlet.class},
    property = {"alias=/appshell", "osgi.http.whiteboard.servlet.asyncSupported=true"})
public class Main extends HttpServlet implements BundleListener {

    private static final Logger logger = LoggerFactory.getLogger(Main.class);

    private static final String PACKAGE_JSON = "javascript/apps/package.json";
    private static final String JAHIA_JSON = "javascript/apps/jahia.json";
    private static final String JAHIA = "jahia";
    private static final String APPS = "apps";
    private static final String REMOTES = "remotes";
    private static final String URLPATTERNS = "urlPatterns";

    private Map<Bundle, JSONObject> bundleDescriptors;
    private List<Pattern> urlPatterns;

    @Activate
    public void activate(ComponentContext componentContext) {
        updateBundleInfos();
        componentContext.getBundleContext().addBundleListener(this);
    }

    @Deactivate
    public void deactivate(ComponentContext componentContext) {
        componentContext.getBundleContext().removeBundleListener(this);
    }

    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            int slashIndex = request.getPathInfo().indexOf('/', 1);
            String appName = slashIndex == -1 ? request.getPathInfo().substring(1) : request.getPathInfo().substring(1, slashIndex);
            String siteKey = getSiteKey(request);

            JahiaUser currentUser = JCRSessionFactory.getInstance().getCurrentUser();
            if (JahiaUserManagerService.isGuest(currentUser)) {
                response.sendRedirect(Jahia.getContextPath() + "/cms/login" +
                    (siteKey != null ? "?site=" + siteKey + "&" : "?") +
                    "redirect=" + response.encodeRedirectURL(request.getRequestURI()));
                return;
            }

            // Restrict access to privileged users
            JCRUserNode userNode = JahiaUserManagerService.getInstance().lookupUserByPath(currentUser.getLocalPath());
            if (!userNode.isMemberOfGroup(null, JahiaGroupManagerService.PRIVILEGED_GROUPNAME)) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN);
                return;
            }

            // lookup for site
            JahiaSite site = ServicesRegistry.getInstance().getJahiaSitesService().getDefaultSite(JCRSessionFactory.getInstance().getCurrentUserSession());

            if (site == null) {
                site = ServicesRegistry.getInstance().getJahiaSitesService().getFirstSiteFound(JCRSessionFactory.getInstance().getCurrentUserSession(), "systemsite");
            }

            // use system site if no site readable.
            if (site == null) {
                site = ServicesRegistry.getInstance().getJahiaSitesService().getSiteByKey("systemsite");
            }

            HttpServletRequestWrapper wrapper = new HttpServletRequestWrapper(request) {
                @Override
                public String getContextPath() {
                    return Jahia.getContextPath();
                }
            };
            wrapper.setAttribute("defaultSite", site);
            wrapper.setAttribute("language", site.getDefaultLanguage());
            wrapper.setAttribute("appName", appName);
            setCustomAttributes(currentUser, wrapper);

            List<String> scripts = getApplicationScripts(appName, APPS);
            scripts = scripts.stream().map(f -> "\"" + response.encodeURL(f) + "\"").collect(Collectors.toList());
            wrapper.setAttribute("scripts", "[" + StringUtils.join(scripts, ",") + "]");

            List<String> remotes = getApplicationScripts(appName, REMOTES);
            wrapper.setAttribute(REMOTES, remotes);

            response.setHeader("Cache-Control", "no-store");
            response.setHeader("Content-Type", "text/html;charset=UTF-8");
            wrapper.getRequestDispatcher("/modules/app-shell/root.jsp").include(wrapper, response);
        } catch (Exception e) {
            logger.error("Error while dispatching: {}", e.getMessage(), e);
        }
    }

    private String getSiteKey(HttpServletRequest request) {

        String siteKey = null;

        // first let's try to resolve the site from a request parameter if it exists
        if (request.getParameter("site") != null && request.getParameter("site").length() < 100) {
            siteKey = request.getParameter("site");
            // we validate the site parameter to protect against attacks.
            if (ServicesRegistry.getInstance().getJahiaSitesService().getSitesNames().contains(siteKey)) {
                return siteKey;
            }
        }

        // now let's try to resolve it from the domain
        if (!Url.isLocalhost(request.getServerName())) {
            try {
                siteKey = ServicesRegistry.getInstance().getJahiaSitesService().getSitenameByServerName(request.getServerName());
                if (siteKey != null) {
                    return siteKey;
                }
            } catch (JahiaException e) {
                logger.error("Error resolving site key from domain", e);
            }
        }

        // finally let's try to resolve it from URL patterns configured in the applications.
        for (Pattern urlPattern : urlPatterns) {
            Matcher urlMatcher = urlPattern.matcher(request.getPathInfo());
            if (urlMatcher.matches()) {
                siteKey = getGroupValue(urlMatcher, "siteKey");
                if (siteKey == null || siteKey.trim().isEmpty()) {
                    String workspace = getGroupValue(urlMatcher,"workspace");
                    Locale locale = LocaleUtils.toLocale(getGroupValue(urlMatcher,"language"));
                    siteKey = getSiteFromNode(getGroupValue(urlMatcher,"nodeUUID"), workspace, locale);
                }
            }
        }
        return siteKey;
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

    public void updateBundleInfos() {
        List<Bundle> packages = getPackages();

        List<Pattern> newUrlPatterns = new ArrayList<>();
        Map<Bundle, JSONObject> newBundleDescriptors = new LinkedHashMap<>();

        for (Bundle bundle : packages) {
            JSONObject pkgJson = null;
            try {
                pkgJson = new JSONObject(IOUtils.toString(bundle.getResource(PACKAGE_JSON) != null ? bundle.getResource(PACKAGE_JSON) : bundle.getResource(JAHIA_JSON)));
                if (pkgJson.has(JAHIA) && pkgJson.getJSONObject(JAHIA).has(URLPATTERNS)) {
                    Object urlPatternsObj = pkgJson.getJSONObject(JAHIA).get(URLPATTERNS);
                    List<String> urlPatternArray = getStringList(urlPatternsObj);
                    for (String urlPattern : urlPatternArray) {
                        Pattern compiledUrlPattern = Pattern.compile(urlPattern);
                        newUrlPatterns.add(compiledUrlPattern);
                    }

                }
                newBundleDescriptors.put(bundle, pkgJson);
            } catch (JSONException | IOException e) {
                logger.warn("Error processing bundle JSON descriptor for bundle {}", bundle, e);
            }
        }

        urlPatterns = newUrlPatterns;
        bundleDescriptors = newBundleDescriptors;

    }


    public List<String> getApplicationScripts(String appName, String key) throws JSONException, IOException {
        LinkedList<String> resources = new LinkedList<>();

        for (Map.Entry<Bundle, JSONObject> bundleDescriptor : bundleDescriptors.entrySet()) {
            List<String> jsBundles = getBundleScripts(bundleDescriptor.getValue(), appName, key);
            for (String jsBundle : jsBundles) {
                if(bundleDescriptor.getKey().getResource(jsBundle) == null) {
                    logger.error("Application {} declared {} has entry point but file is not found, skipping it from {}",bundleDescriptor.getKey().getSymbolicName(), jsBundle, key);
                    continue;
                }
                if (jsBundle.startsWith("/")) {
                    resources.add(jsBundle);
                } else {
                    resources.add("/modules/" + bundleDescriptor.getKey().getSymbolicName() + "/" + jsBundle);
                }
            }
        }
        return resources;
    }

    private List<Bundle> getPackages() {
        return Arrays.stream(FrameworkService.getBundleContext().getBundles())
            .filter(bundle -> bundle.getState() == BundleState.ACTIVE.toInt() &&
                BundleUtils.isJahiaModuleBundle(bundle) &&
                (bundle.getResource(PACKAGE_JSON) != null || bundle.getResource(JAHIA_JSON) != null))
            .collect(Collectors.toList());
    }

    private List<String> getBundleScripts(JSONObject pkgJson, String appName, String key) throws IOException, JSONException {
        boolean hasExtend = pkgJson.has(JAHIA) && pkgJson.getJSONObject(JAHIA).has(key) && pkgJson.getJSONObject(JAHIA).getJSONObject(key).has(appName);
        if (hasExtend) {
            Object res = pkgJson.getJSONObject(JAHIA).getJSONObject(key).get(appName);
            return getStringList(res);
        }
        return Collections.emptyList();
    }

    private List<String> getStringList(Object jsonObject) throws JSONException {
        if (jsonObject instanceof JSONArray) {
            JSONArray jsonArray = (JSONArray) jsonObject;
            List<String> stringList = new ArrayList<>();
            for (int i = 0; i < jsonArray.length(); i++) {
                stringList.add(jsonArray.getString(i));
            }
            return stringList;
        } else {
            return Collections.singletonList(jsonObject.toString());
        }
    }

    private String getSiteFromNode(String nodeUUID, String workspace, Locale locale) {
        if (nodeUUID == null || nodeUUID.trim().isEmpty()) {
            return null;
        }
        try {
            return JCRTemplate.getInstance().doExecuteWithSystemSessionAsUser(null, workspace, locale, new JCRCallback<String>() {
                @Override
                public String doInJCR(JCRSessionWrapper session) throws RepositoryException {
                    JCRNodeWrapper node = session.getNodeByUUID(nodeUUID);
                    JCRSiteNode siteNode = node.getResolveSite();
                    if (siteNode != null) {
                        return siteNode.getName();
                    }
                    return null;
                }
            });
        } catch (RepositoryException e) {
            logger.error("Error retrieving site from node", e);
        }
        return null;
    }

    @Override
    public void bundleChanged(BundleEvent bundleEvent) {
        updateBundleInfos();
    }

    private String getGroupValue(Matcher matcher, String groupName) {
        try {
            return matcher.group(groupName);
        } catch (IllegalArgumentException iae) {
            return null;
        }
    }
}
