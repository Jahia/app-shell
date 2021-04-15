package org.jahia.modules.appshell;

public class License {
    public static boolean isAllowed(String feature) {
        try {
            Class<?> c;
            c = getLicenseClass();
            return (boolean) c.getMethod("isAllowed", String.class).invoke(null, feature);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    private static Class<?> getLicenseClass() throws ClassNotFoundException {
        Class<?> c;
        try {
            c = Class.forName("org.jahia.security.spi.LicenseCheckUtil");
        } catch (ClassNotFoundException e) {
            c = Class.forName("org.jahia.security.license.LicenseCheckerService$Stub");
        }
        return c;
    }
}
