# Declare new module

To declare a new module, you have two possibilities:
* Simple module with very little to no javascript (e.g: a legacy site settings)
* More complex modules with react and using Jahia moonstone design system

## Common step

### Declare your module
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
This file will be the entry point that will contain the initialization part of your module.

### Load/Register your app
You will need to create the JS file you declared in the `jahia.json` file in this example `register.js`, and add the logic you need inside. The module can register
different extensions in the application. In simple JS module this file can be written manually, in complex modules in will be generated by a JS bundler like webpack. 
This file should remain small, as the application won't start until it's fully loaded and executed.

### Registrations
All extensions are added into the registry by calling the `registry.add` function. The `registry` object can be found by importing `registry` from `@jahia/ui-extender`. The `add` function taks at least 3 parameters : the type of extension to register, its unique id, and an object
describing the extension.

To ease this process when doing simple JS, we expose a few things in the window.jahia object. As of today in the jahia object you can find 3 things:
 - uiExtender, which contains the registry
 - moonstone, which contains React components and utility functions from the moonstone design system
 - i18n, which contains all the necessary function to handle translations
 - ui, contains reusable components from the application

#### Routes
React routes can be added in the application as extension. For example the following can be used to declare a new route /linkchecker (path) 
that will display a linkchecker (render) in the main area (target) :
  
```js
window.jahia.uiExtender.registry.add('route', 'route-jcontent', {
      targets: ['main:2'],
      path: `/linkchecker`, // Catch /linkchecker urls
      render: function () {           // The render function for my route in this example we want to display an iframe which contains our legacy site settings, to do that we pass the URL to the `getIframeRenderer` function
        return window.jahia.ui.getIframeRenderer(window.contextJsParameters.contextPath + '/cms/editframe/default/sites/$site-key.linkChecker.html');
      }
  });
```

#### Handling site logins properly

As sites may create their own users, it is important to properly handle URL generation and URL patterns to make sure that site users can login properly when directly accessing your application.

The easiest way to do this is to make sure the siteKey is always included in the URLs that your application generates, so that if someone sends an URL to another user, they can also login with a site user (server users will always work). You will also need to setup a URL pattern so that the appshell know where to find the site. See the next section for more information about URL patterns.

There is an alternative way to handle site logins, by appending a `?site=` parameter to the URL. Let's take an example with the following URL:

    http://localhost:8080/jahia/administration

If you use this URL, only server users and users of the default site will be able to login. However, if you use instead:

    http://localhost:8080/jahia/administration?site=MYSITEKEY

It will work for server users and users of the site that has a key called `MYSITEKEY`. Your application could also choose this method to generate URLs that will always work properly.

#### URL Patterns

If you are adding routes in your application, you might also need to add URL patterns to your application's descriptor. The appshell needs this information to know how to resolve the site on which your application is working, so that site users can be properly authenticated. There are two ways the appshell can resolve a site from an URL:

- The URL contains a site key 
- The URL contains a node UUID

URL patterns can be very flexible. They can be either declared in the `package.json` file or the `jahia.json` file in the `jahia` section, here is an example: 

````json
"urlPatterns": {
  "jahia" : "/content-editor/(?<language>\\S*?)/(?<operation>\\S*?)/(?<nodeUUID>\\S*?)"    
}
````

You can find the file for this example here: https://github.com/Jahia/content-editor/blob/master/package.json

It is also possible to pass an array of patterns instead of a single string, in case it is needed. 

In this example, the URL contains a nodeUUID, which will be used to load a node, and upon which we will resolve the site. The URL pattern uses regular expression group names. The following group names are recognized by the appshell:

| Group Name | Description | Default value |
| ---------- | ----------- | ------------- |
| siteKey    | The site identifier, it must exist (it is checked) | n/a |
| nodeUUID   | A valid node UUID identifier | n/a |
| workspace  | The workspace to use to load the node | default |
| language   | The language to use to load the node | site default |

Here is an example of using the site key : 

```json
    "urlPatterns" : {
      "jahia" : "/jcontent/(?<siteKey>\\S*?)/(?<language>\\S*?)/(?<contentPath>\\S*)"
}
```

You have a choice between using a `siteKey` or a `nodeUUID` but you must provide one or the other or the site resolution for the app might not work.

#### Primary nav items

Item in the primary nav bar can be added as `primary-nav-item` - Here, add a link to `/linkchecker` (path) into the main primary nav (target) with a label and an icon. 

```js
// Call the add method from the registry which is in uIExtender to add a menu entry to point to my module
// `primary-nav-item` is the type I want to register and `linkcheckerRoute` is the key (must be unique), the last parameter is an object with the necessary options
window.jahia.uiExtender.registry.add('primary-nav-item', 'linkcheckerRoute', {
    targets: ['nav-root-top:21'],       // Which menu I want to extend, it can take multiple values, each value can be ordered `target:position`
    path: '/linkchecker',               // Path to call when clicking on my link
    label: 'linkchecker:label.title',   // RB to use to display the name of my link `namespace:key`
    icon: window.jahia.moonstone.toIconComponent('Feather')  // Icon to use with my link, we must use the `toIconComponent` function to make sure we return an Icon Component
});

```
#### Admin panels

Administration panels can be registered with a single entry, that will add an item in the tree and the appropriate route at the same time.

```js
window.jahia.uiExtender.registry.add('adminRoute', 'linkchecker', {
    targets: ['jcontent:10'],
    label: 'linkchecker:label.title',
    isSelectable: true,
    requiredPermission: 'siteAdminLinkChecker',
    requireModuleInstalledOnSite: 'linkchecker',
    iframeUrl: window.contextJsParameters.contextPath + '/cms/editframe/default/$lang/sites/$site-key.linkChecker.html'
});
```

- target defines where the item will be added. Can be for example : `administration-server`, `administration-sites`, `jcontent`. 
If you want to add under an existing item, you can use `<main-target>-<parent-item-key>` - for example, `administration-server-usersAndRoles`
- iframeUrl is a shortcut for : 
```    
render: function () {
    return window.jahia.ui.getIframeRenderer(window.contextJsParameters.contextPath + '/cms/adminframe/default/sites/$site-key.linkChecker.html');
}
```
If you need to render something else than an iframe, use the render field instead.

#### Actions

You can add actions in the application anywhere buttons or menu entries are displayed.

```js
window.jahia.uiExtender.registry.add('action', 'downloadFile', {
    buttonIcon: window.jahia.moonstone.toIconComponent('CloudDownload'),
    buttonLabel: 'jcontent:label.contentManager.contentPreview.download',
    targets: ['contentActions:10'],
    onClick: context => {
        window.open(context.path);
    }
});
```

#### Translation namespaces
If you want to use translated label in your module, you need to declare your module namespace, which must be your module name :
```js
// Declare the namespace to find the translations for my module, put the name of your module and reuse it in your labels
window.jahia.i18n.loadNamespaces('linkchecker');
```

This will download the translations from JSON files under the following path `src/main/resources/javascript/locales/<lang>.json`:

```json
{
  "label" : {
    "title": "Link Checker"
  }
}
```

## More complex modules
#### Maven

add a maven dependency on `app-shell` to your project with the classifier manifest:
```xml
<dependency>
    <groupId>org.jahia.modules</groupId>
    <artifactId>app-shell</artifactId>
    <version>1.4.0-SNAPSHOT</version>
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
               <artifactId>app-shell</artifactId>
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
            manifest: require('./target/dependency/app-shell-1.0.0-SNAPSHOT-manifest')
        }),
        new CopyWebpackPlugin([{ from: './package.json', to: '' }])
    ]
}
```
