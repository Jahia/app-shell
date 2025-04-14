/*
 * MIT License
 *
 * Copyright (c)  Jahia Solutions Group. All rights reserved.
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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * License check
 */
public class License {
    private static Logger logger = LoggerFactory.getLogger(License.class);

    private License() {
    }

    /**
     * License check
     */
    public static boolean isAllowed(String feature) {
        try {
            Class<?> c;
            c = getLicenseClass();
            return (boolean) c.getMethod("isAllowed", String.class).invoke(null, feature);
        } catch (Exception e) {
            logger.error("Cannot check license", e);
        }
        return false;
    }

    private static Class<?> getLicenseClass() throws ClassNotFoundException {
        Class<?> c;
        try {
            // Use this class for >= 8.0.3.0
            c = Class.forName("org.jahia.security.spi.LicenseCheckUtil");
        } catch (ClassNotFoundException e) {
            // Otherwise this one before 8.0.3.0
            c = Class.forName("org.jahia.security.license.LicenseCheckerService$Stub");
        }
        return c;
    }
}
