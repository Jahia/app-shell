# Loading screen

This module also contains a loading screen that can be setup to make users wait for large scripts or pages to initialize.
It works by using the GWT ModuleGWTResources extension mechanism to load small scripts that will display immediately a
loading screen until all the content of the GWT iframe are loaded.

Here's an example of how to activate the loading screen from a module (it is deactivated by default) :

In `src/main/resources/META-INF/spring/my-module.xml`:

```
   <bean class="org.jahia.ajax.gwt.helper.ModuleGWTResources">
        <property name="javascriptResources">
            <list>
                <value>/modules/my-module/javascript/activate-loader.js</value>
            </list>
        </property>
    </bean>
```

In `src/main/resources/javascript/activate-loader.js`:

```
    (function () {

        // the following is just an example but you should have a condition here otherwise it will apply to all the GWT engines
        if (window.location.href.indexOf('/cms/my-module-mode') === -1) {
            return;
        }

        function waitForFunction() {
            if (window.displayDXLoadingScreen) {
                window.displayDXLoadingScreen({
                    "en" : "Loading My Module...",
                    "fr" : "Chargement de My Module...",
                    "de" : "My Module wird geladen...",
                });
            } else {
                console.log("Waiting for 100ms for function window.displayDXLoadingScreen to become available");
                setTimeout(waitForFunction, 100);
            }
        }

        waitForFunction();

    })();

```
