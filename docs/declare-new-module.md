# Declare new module

To declare a new module, you have two possibilities:
* Simple module with very little to no javascript (e.g: a legacy site settings)
* More complex modules with react and using Jahia moonstone design system

## Common step

#### Declare your module
Create a `jahia.json` file under `src/main/resources/javascript/apps/jahia.json` with the following content:
```json
{
  "jahia": {
    "apps": {
      "jahia": "javascript/apps/register.js"
    }
  }
}
```
Let's decrypt the most important part `"jahia": "javascript/apps/register.js"` the key here is the app you want to extend and the value is the path to the file that will load/register your app.

#### Load/Register your app
You will need to create the JS file you declared in the `jahia.json` file in this example `register.js`, and add the logic you need inside, something like that:
```js
/**
 *  To ease this process we expose a few things in the window, as of today in the jahia object you can find 3 things:
 *  - uiExtender, which contains the registry
 *  - moonstone, which contains React components and utility functions from the moonstone design system
 *  - i18n, which contains all the necessary function to handle resource bundles (RB)
 */

// Declare the namespace to find the resource bundles for my module, put the name you want as long as you reuse it with your RB
window.jahia.i18n.loadNamespaces('linkchecker');

// Call the add method from the registry which is in uIExtender to add a menu entry to point to my module
// `primary-nav-item` is the type I want to register and `linkcheckerRoute` is the key (must be unique), the last parameter is an object with the necessary options
window.jahia.uiExtender.registry.add('primary-nav-item', 'linkcheckerRoute', {
    targets: ['nav-root-top:21'],        // Which menu I want to extend, it can take multiple values, each value can be ordered `target:position`
    path: '/linkchecker',               // Path to call when clicking on my link
    label: 'linkchecker:label.title',   // RB to use to display the name of my link `namespace:key`
    icon: window.jahia.moonstone.toIconComponent('Feather', {size: 'big'})  // Icon to use with my link, we must use the `toIconComponent` function to make sure we return an Icon Component
});
/**
 *  the toIconComponent function take 2 parameters:
 *  - The first one is a string which can be:
 *      - The name of an icon present in moonstone.
 *      - A SVG icon as a string.
 *      - An URL that point to an icon.
 *  - The second parameter is an object which contains the props of the icon component like the size (size can be `small`, `default` or `big`, if you don't pass a size it will be `default`
 */

// Call the add method again this time to register the route called by the menu entry we declared previously
// `route` is the type I want to register and `linkcheckerRoute` is the key (must be unique), the last parameter is an object with the necessary options
window.jahia.uiExtender.registry.add('route', 'linkcheckerRoute', {
    targets: ['nav-root-top'],      // The target where you want your route to be used in the example in the main navigation
    path: '/linkchecker',           // Path that will trigger my route
    render: function () {           // The render function for my route in this example we want to display an iframe which contains our legacy site settings, to do that we pass the URL to the `getIframeRenderer` function
        return window.jahia.uiExtender.getIframeRenderer(window.contextJsParameters.contextPath + '/cms/editframe/default/sites/$site-key.linkChecker.html');
    }
});
```

#### Ressource bundles (RB)
We are using resource bundles but we need to create them in JSON files under the following path `src/main/resources/javascript/locales/en.json`:
```json
{
  "label" : {
    "title": "Link Checker"
  }
}
```

## More complex modules
#### Maven

add a maven dependency on `dx-commons-webpack` to your project with the classifier manifest:
```xml
<dependency>
    <groupId>org.jahia.modules</groupId>
    <artifactId>dx-commons-webpack</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <type>json</type>
    <classifier>manifest</classifier>
</dependency>
```

And use copy plugin:
```xml
<plugin>
   <groupId>org.apache.maven.plugins</groupId>
   <artifactId>maven-dependency-plugin</artifactId>
   <executions>
       <execution>
           <id>copy</id>
           <phase>initialize</phase>
           <goals>
               <goal>copy</goal>
           </goals>
       </execution>
   </executions>
   <configuration>
       <artifactItems>
           <artifactItem>
               <groupId>org.jahia.modules</groupId>
               <artifactId>dx-commons-webpack</artifactId>
               <type>json</type>
               <classifier>manifest</classifier>
           </artifactItem>
       </artifactItems>
   </configuration>
</plugin>
```
This provides the manifest that contains all shared packages while building the application or the extension.

#### Set webpack configuration to use DLL and CopyWebpackPlugin to provide package.json
The output exposed of the extension must be a single file named `*.bundle.js`
```js
{
    output: {
        path: path.resolve(__dirname, 'src/main/resources/javascript/apps/'),
        filename: 'content-editor-ext.bundle.js',
        chunkFilename: '[name].content-editor.[chunkhash:6].js'
    }
}
```

And the plugin configuration:
```js
{
    plugins: [
        new webpack.DllReferencePlugin({
            manifest: require('./target/dependency/dx-commons-webpack-1.0.0-SNAPSHOT-manifest')
        }),
        new CopyWebpackPlugin([{ from: './package.json', to: '' }])
    ]
}
```
