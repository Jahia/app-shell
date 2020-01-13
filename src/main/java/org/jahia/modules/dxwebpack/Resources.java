package org.jahia.modules.dxwebpack;

import org.jahia.ajax.gwt.helper.ModuleGWTResources;
import org.osgi.service.component.annotations.Component;

import java.util.Arrays;

@Component(service = ModuleGWTResources.class, immediate = true)
public class Resources extends ModuleGWTResources {
    public Resources() {
        setJavascriptResources(Arrays.asList(
                "/modules/dx-commons-webpack/javascript/polyfills.js",
                "/modules/dx-commons-webpack/javascript/loader.js"
        ));
    }
}
