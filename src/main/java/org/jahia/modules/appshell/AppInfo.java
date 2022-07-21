package org.jahia.modules.appshell;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Represents all the server information for an app in the AppShell, including script declarations and URL patterns
 */
public class AppInfo {

    private String appName;
    private Map<String, List<String>> scripts = new LinkedHashMap<>();
    private List<Pattern> compiledUrlPatterns = new ArrayList<>();

    public String getAppName() {
        return appName;
    }

    public void setAppName(String appName) {
        this.appName = appName;
    }

    public Map<String, List<String>> getScripts() {
        return scripts;
    }

    public void setScripts(Map<String, List<String>> scripts) {
        this.scripts = scripts;
    }

    public List<Pattern> getCompiledUrlPatterns() {
        return compiledUrlPatterns;
    }

    public void setCompiledUrlPatterns(List<Pattern> compiledUrlPatterns) {
        this.compiledUrlPatterns = compiledUrlPatterns;
    }
}
