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
package org.jahia.modules.dxwebpack.loader;

import com.google.common.base.Joiner;
import com.vdurmont.semver4j.Semver;
import org.apache.commons.io.IOUtils;
import org.jahia.exceptions.JahiaRuntimeException;
import org.jahia.osgi.BundleState;
import org.jahia.osgi.BundleUtils;
import org.jahia.osgi.FrameworkService;
import org.jahia.taglibs.AbstractJahiaTag;
import org.json.JSONException;
import org.json.JSONObject;
import org.osgi.framework.Bundle;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.jsp.JspException;
import java.io.IOException;
import java.net.URL;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Tag that provide js loader and load shared js resources and expose extension js bundles
 */
public class LoaderTag extends AbstractJahiaTag {

    public static final Logger logger = LoggerFactory.getLogger(LoaderTag.class);

    private static final String PACKAGE_JSON = "javascript/apps/package.json";
    private static final String DX_EXTENDS = "dx-extends";

    private String target = "extends";

    @Override
    public int doEndTag() throws JspException {
        try {

            // get current package.json from current bundle
            URL currentPackageUrl = Thread.currentThread().getContextClassLoader().getResource(PACKAGE_JSON);
            if (currentPackageUrl == null) {
                String moduleName = getClass().getClassLoader().toString();
                logger.warn("unable to locate [package.json] in {}", moduleName);
                return super.doEndTag();
            }
            JSONObject currentPackage = new JSONObject(IOUtils.toString(currentPackageUrl));
            String name = currentPackage.getString("name");
            String version = currentPackage.getString("version");
            // here we must scan all the bundles to find all the Javascript files to include that will
            // build the action lists.

            LinkedList<String> resources = new LinkedList<>();

            for (Bundle bundle : getPackages()) {
                if (isBundleMatchNameAndVersion(bundle, name, version)) {
                    // lookup for *.bundle.js in the bundle and provide it as resources to load
                    String jsBundle = getJSBundle(bundle);
                    if (jsBundle != null) {
                        resources.addFirst("\"" + jsBundle + "\"");
                    }
                }
            }

            // Add JS Load to the resources

            // Add JSLoad Script as resource / provide extensions to load
            String contextPath = getRenderContext().getRequest().getContextPath();
            String out = "<jahia:resource type=\"javascript\" path=\"" + contextPath + "/modules/dx-commons-webpack/javascript/js-load.js\" resource=\"js-load.js\"/>\n";
            if (!resources.isEmpty()) {
                out += "<script>window[\"" + target + "\"]=[" + Joiner.on(",").join(resources) + "]</script>";
            }

            pageContext.getOut().print(out);

        } catch (IOException | JSONException e) {
            throw new JahiaRuntimeException(e);
        }
        return super.doEndTag();

    }

    private List<Bundle> getPackages() {
        return Arrays.stream(FrameworkService.getBundleContext().getBundles())
                .filter(bundle -> bundle.getState() == BundleState.ACTIVE.toInt() && BundleUtils.isJahiaModuleBundle(bundle) && bundle.getResource(PACKAGE_JSON) != null)
                .collect(Collectors.toList());
    }

    private String getJSBundle(Bundle bundle) {
        Enumeration<String> en = bundle.getEntryPaths("javascript/apps");
        while (en.hasMoreElements()) {
            String element = en.nextElement();
            if (element.startsWith("javascript/apps/") && element.endsWith("bundle.js")) {
                return "/modules/" + bundle.getSymbolicName() + "/" + element;
            }
        }
        return null;
    }

    private boolean isBundleMatchNameAndVersion(Bundle bundle, String moduleName, String version) throws IOException, JSONException {
        JSONObject pkgJson = new JSONObject(IOUtils.toString(bundle.getResource(PACKAGE_JSON)));
        boolean hasExtend = pkgJson.has(DX_EXTENDS) && pkgJson.getJSONObject(DX_EXTENDS).has(moduleName);
        if (hasExtend) {
            Semver pkgVersion = new Semver(version, Semver.SemverType.NPM);
            return pkgVersion.satisfies(pkgJson.getJSONObject(DX_EXTENDS).getString(moduleName));
        }
        return false;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }
}
