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
import org.jahia.commons.Version;
import org.jahia.exceptions.JahiaException;
import org.jahia.osgi.BundleState;
import org.jahia.osgi.BundleUtils;
import org.jahia.osgi.FrameworkService;
import org.jahia.services.content.*;
import org.jahia.services.content.decorator.JCRSiteNode;
import org.jahia.services.content.decorator.JCRUserNode;
import org.jahia.services.sites.JahiaSite;
import org.jahia.services.sites.JahiaSitesService;
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
import org.osgi.service.component.annotations.Reference;
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

import static javax.servlet.http.HttpServletResponse.SC_FORBIDDEN;
import static javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;

@Component(service = {javax.servlet.http.HttpServlet.class, javax.servlet.Servlet.class},
    property = {"alias=/appshell", "osgi.http.whiteboard.servlet.asyncSupported=true"}, immediate = true)
public class Main extends HttpServlet implements BundleListener {

    private static final Logger logger = LoggerFactory.getLogger(Main.class);

    private static final String PACKAGE_JSON = "javascript/apps/package.json";
    private static final String JAHIA_JSON = "javascript/apps/jahia.json";
    private static final String JAHIA = "jahia";
    private static final String APPS = "apps";
    private static final String REMOTES = "remotes";
    private static final String URLPATTERNS = "urlPatterns";

    private Map<String, AppInfo> appInfos;

    private JahiaUserManagerService jahiaUserManagerService;
    private JCRSessionFactory jcrSessionFactory;
    private JahiaSitesService jahiaSitesService;
    private JCRTemplate jcrTemplate;

    @Reference
    public void setJahiaUserManagerService(JahiaUserManagerService jahiaUserManagerService) {
        this.jahiaUserManagerService = jahiaUserManagerService;
    }

    @Reference
    public void setJcrSessionFactory(JCRSessionFactory jcrSessionFactory) {
        this.jcrSessionFactory = jcrSessionFactory;
    }

    @Reference
    public void setJahiaSitesService(JahiaSitesService jahiaSitesService) {
        this.jahiaSitesService = jahiaSitesService;
    }

    @Reference
    public void setJcrTemplate(JCRTemplate jcrTemplate) {
        this.jcrTemplate = jcrTemplate;
    }

    @Activate
    public void activate(ComponentContext componentContext) {
        updateAppInfos();
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
            AppInfo appInfo = appInfos.get(appName);
            String appPathInfo = slashIndex == -1 ? "" : request.getPathInfo().substring(slashIndex);
            String siteKey = getSiteKey(request, appPathInfo, appInfo);

            JahiaUser currentUser = jcrSessionFactory.getCurrentUser();
            if (JahiaUserManagerService.isGuest(currentUser)) {
                // Keep compatibility with jahia 8.0.0.0 (Change happen in 8.1.3.1)
                if (new Version("8.1.3.1").compareTo(new Version(Jahia.VERSION)) < 0) {
                    // use old way of redirect
                    response.sendRedirect(Jahia.getContextPath() + "/cms/login" +
                        (siteKey != null ? "?site=" + siteKey + "&" : "?") +
                        "redirect=" + response.encodeRedirectURL(request.getRequestURI()));
                    return;
                }
                request.setAttribute("siteKey", siteKey);
                response.sendError(SC_UNAUTHORIZED);
                return;
            }
            JCRUserNode userNode = jahiaUserManagerService.lookupUserByPath(currentUser.getLocalPath());
            // Restrict access to privileged users
            if (!userNode.isMemberOfGroup(null, JahiaGroupManagerService.PRIVILEGED_GROUPNAME)) {
                request.setAttribute("siteKey", siteKey);
                response.sendError(SC_FORBIDDEN);
                return;
            }

            // lookup for site
            JahiaSite site = jahiaSitesService.getDefaultSite(jcrSessionFactory.getCurrentUserSession());

            if (site == null) {
                site = jahiaSitesService.getFirstSiteFound(jcrSessionFactory.getCurrentUserSession(), "systemsite");
            }

            // use system site if no site readable.
            if (site == null) {
                site = jahiaSitesService.getSiteByKey("systemsite");
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

            List<String> scripts = (appInfo != null && appInfo.getScripts().get(APPS) != null) ? appInfo.getScripts().get(APPS) : new ArrayList<>();
            scripts = scripts.stream().map(f -> "\"" + response.encodeURL(f) + "\"").collect(Collectors.toList());
            wrapper.setAttribute("scripts", "[" + StringUtils.join(scripts, ",") + "]");

            List<String> remotes = (appInfo != null && appInfo.getScripts().get(REMOTES) != null) ? appInfo.getScripts().get(REMOTES) : new ArrayList<>();
            wrapper.setAttribute(REMOTES, remotes);

            response.setHeader("Cache-Control", "no-store");
            response.setHeader("Content-Type", "text/html;charset=UTF-8");
            wrapper.getRequestDispatcher("/modules/app-shell/root.jsp").include(wrapper, response);
        } catch (Exception e) {
            logger.error("Error while dispatching: {}", e.getMessage(), e);
        }
    }

    private String getSiteKey(HttpServletRequest request, String appPathInfo, AppInfo appInfo) {

        String siteKey = request.getParameter("site");
        ;

        // first let's try to resolve the site from a request parameter if it exists
        if (siteKey != null && siteKey.length() < 100) {
            // we validate the site parameter to protect against attacks.
            if (jahiaSitesService.getSitesNames().contains(siteKey)) {
                return siteKey;
            }
        }

        // now let's try to resolve it from the domain
        if (!Url.isLocalhost(request.getServerName())) {
            try {
                siteKey = jahiaSitesService.getSitenameByServerName(request.getServerName());
                if (siteKey != null) {
                    return siteKey;
                }
            } catch (JahiaException e) {
                logger.error("Error resolving site key from domain", e);
            }
        }

        // finally let's try to resolve it from URL patterns configured in the applications.
        if (appInfo != null && appInfo.getCompiledUrlPatterns().size() > 0) {
            for (Pattern urlPattern : appInfo.getCompiledUrlPatterns()) {
                Matcher urlMatcher = urlPattern.matcher(appPathInfo);
                if (urlMatcher.matches()) {
                    siteKey = getGroupValue(urlMatcher, "siteKey");
                    if (StringUtils.isBlank(siteKey)) {
                        String workspace = getGroupValue(urlMatcher, "workspace");
                        Locale locale = LocaleUtils.toLocale(getGroupValue(urlMatcher, "language"));
                        siteKey = getSiteFromNode(getGroupValue(urlMatcher, "nodeUUID"), workspace, locale);
                    }
                    if (siteKey != null) {
                        return siteKey;
                    }
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

    public void updateAppInfos() {
        List<Bundle> packages = getBundlesWithPackages();

        Map<String, AppInfo> newAppInfos = new LinkedHashMap<>();
        for (Bundle bundle : packages) {
            updateBundleInfo(newAppInfos, bundle);
        }
        appInfos = newAppInfos;
    }

    private void updateBundleInfo(Map<String, AppInfo> newAppInfos, Bundle bundle) {
        JSONObject pkgJson = null;
        try {
            pkgJson = new JSONObject(IOUtils.toString(bundle.getResource(PACKAGE_JSON) != null ? bundle.getResource(PACKAGE_JSON) : bundle.getResource(JAHIA_JSON)));
            if (pkgJson.has(JAHIA)) {
                if (pkgJson.getJSONObject(JAHIA).has(URLPATTERNS)) {
                    processUrlPatterns(newAppInfos, pkgJson);
                }
                if (pkgJson.getJSONObject(JAHIA).has(REMOTES)) {
                    processKeyScripts(newAppInfos, pkgJson, bundle, REMOTES);
                }
                if (pkgJson.getJSONObject(JAHIA).has(APPS)) {
                    processKeyScripts(newAppInfos, pkgJson, bundle, APPS);
                }
            }
        } catch (JSONException | IOException e) {
            logger.error("Error processing bundle JSON descriptor for bundle {}", bundle.getSymbolicName(), e);
        }
    }

    /**
     * A value processor interface to offer a customizable way of processing app descriptor values
     */
    interface ValueProcessor {

        /**
         * This method should be implemented to provide a way to process a list of values that is passed as
         * input into the AppInfo object that is passed as the second parameter (meaning that we are writing
         * to it)
         *
         * @param values  the list of string values to be processed
         * @param appInfo the AppInfo object we want to modify based on the input values
         */
        void processValues(List<String> values, AppInfo appInfo);
    }

    private void processUrlPatterns(Map<String, AppInfo> newAppInfos, JSONObject pkgJson) throws JSONException {
        JSONObject appsUrlPatterns = pkgJson.getJSONObject(JAHIA).getJSONObject(URLPATTERNS);
        processAppValues(newAppInfos, appsUrlPatterns, (values, appInfo) -> {
            for (String urlPattern : values) {
                Pattern compiledUrlPattern = Pattern.compile(urlPattern);
                appInfo.getCompiledUrlPatterns().add(compiledUrlPattern);
            }
        });
    }

    private void processKeyScripts(Map<String, AppInfo> newAppInfos, JSONObject pkgJson, Bundle bundle, String key) throws JSONException {
        JSONObject scriptObj = pkgJson.getJSONObject(JAHIA).getJSONObject(key);
        processAppValues(newAppInfos, scriptObj, (values, appInfo) -> {
            for (String script : values) {
                if (bundle.getResource(script) == null) {
                    logger.error("Application {} declared {} has entry point but file is not found, skipping it from {}", bundle.getSymbolicName(), script, key);
                    return;
                }
                List<String> scripts = appInfo.getScripts().get(key);
                if (scripts == null) {
                    scripts = new ArrayList<>();
                }
                if (script.startsWith("/")) {
                    scripts.add(script);
                } else {
                    scripts.add("/modules/" + bundle.getSymbolicName() + "/" + script);
                }
                appInfo.getScripts().put(key, scripts);
            }
        });
    }

    private void processAppValues(Map<String, AppInfo> newAppInfos, JSONObject appValues, ValueProcessor valueProcessor) throws JSONException {
        Iterator<String> appNameIter = appValues.keys();
        while (appNameIter.hasNext()) {
            String appName = appNameIter.next();
            AppInfo appInfo = newAppInfos.get(appName);
            if (appInfo == null) {
                appInfo = new AppInfo();
                appInfo.setAppName(appName);
            }
            Object appValuesObj = appValues.get(appName);
            List<String> appValuesList = getArrayOrStringValues(appValuesObj);
            valueProcessor.processValues(appValuesList, appInfo);
            newAppInfos.put(appName, appInfo);
        }
    }

    private List<Bundle> getBundlesWithPackages() {
        return Arrays.stream(FrameworkService.getBundleContext().getBundles())
            .filter(bundle -> bundle.getState() == BundleState.ACTIVE.toInt() &&
                BundleUtils.isJahiaModuleBundle(bundle) &&
                (bundle.getResource(PACKAGE_JSON) != null || bundle.getResource(JAHIA_JSON) != null))
            .collect(Collectors.toList());
    }

    private List<String> getArrayOrStringValues(Object jsonObject) throws JSONException {
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
        if (StringUtils.isBlank(nodeUUID)) {
            return null;
        }
        try {
            return jcrTemplate.doExecuteWithSystemSessionAsUser(null, workspace, locale, new JCRCallback<String>() {
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
        updateAppInfos();
    }

    private String getGroupValue(Matcher matcher, String groupName) {
        try {
            return matcher.group(groupName);
        } catch (IllegalArgumentException iae) {
            return null;
        }
    }
}
