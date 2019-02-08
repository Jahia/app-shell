package org.jahia.modules.dxwebpack.loader;

import org.jahia.osgi.BundleState;
import org.jahia.osgi.BundleUtils;
import org.jahia.osgi.FrameworkService;
import org.jahia.services.render.RenderContext;
import org.jahia.taglibs.AbstractJahiaTag;
import org.osgi.framework.Bundle;

import javax.servlet.jsp.JspException;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

public class LoaderTag extends AbstractJahiaTag {

    private String baseExt;

    public void setBaseExt(String baseExt) {
        this.baseExt = baseExt;
    }

    @Override
    public int doEndTag() throws JspException {
        try {
            // here we must scan all the bundles to find all the Javascript files to include that will
            // build the action lists.
            Bundle[] bundles = FrameworkService.getBundleContext().getBundles();
            List<String> resources = new ArrayList<>();
            for (int i = 0; i < bundles.length; i++) {
                Bundle bundle = bundles[i];
                if (bundle.getState() == BundleState.ACTIVE.toInt() && BundleUtils.isJahiaModuleBundle(bundle) && bundle.getResources("javascript/apps") != null) {
                    Enumeration<String> en = bundle.getEntryPaths("javascript/apps");
                    while (en.hasMoreElements()) {
                        String element = en.nextElement();
                        if (element.startsWith("javascript/apps/" + baseExt + "-ext.") && element.endsWith(".js")) {
                            resources.add("/modules/" + bundle.getSymbolicName() + "/" + element);
                        }
                    }

                }
            }

            RenderContext renderContext = (RenderContext) pageContext.findAttribute("renderContext");
            String contextPath = renderContext.getRequest().getContextPath();

            for (String resource : resources) {
                // Todo: generate bootstrap() from js-load.js
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            baseExt = null;
        }
        return super.doEndTag();

    }


}
