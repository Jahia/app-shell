# Declare new module

## Maven

add a maven dependency to this project:

```
<dependency>
    <groupId>org.jahia.modules</groupId>
    <artifactId>dx-commons-webpack</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <type>json</type>
    <classifier>manifest</classifier>
</dependency>
```

And use copy plugin:

```
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

## Set webpack configuration to use DLL and CopyWebpackPlugin to provide package.json

The output exposed of the extension must be a single file named `*.bundle.js`

```
output: {
            path: path.resolve(__dirname, 'src/main/resources/javascript/apps/'),
            filename: 'content-editor-ext.bundle.js',
            chunkFilename: '[name].content-editor.[chunkhash:6].js'
        }
```

Plugin configuration:

```
  plugins: [
    new webpack.DllReferencePlugin({
      manifest: require('./target/dependency/dx-commons-webpack-1.0.0-SNAPSHOT-manifest')
    }),
    new CopyWebpackPlugin([{ from: './package.json', to: '' }])
  ]
```

## Define the modules that can be extended

Set apps that are extended in the `package.json` file using the following format

```
  "dx-extends": {
    "@jahia/content-manager": "^1.2.0"
  },
```

## Add the loader to the main application

Use the tag `<js:loader/>` to load the shared resources, the loader script and expose available extensions
The parameter tag `target` defines the window variable that will receive the array of extensions (default is `target`)
Use that array to call the loader script (`bootstap()`) with the application as last entry of the array, as follow:

```
    <js:loader target="cmm-extends"/>
...
    window['cmm-extends'].push('/modules/content-media-manager/javascript/apps/cmm.bundle.js');
    bootstrap(window['cmm-extends']);
```

In the current state, the extensions found will provide the first file named `javascript/apps/*.bundle.js` found in the extension DX bundle
