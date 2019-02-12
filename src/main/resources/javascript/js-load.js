/* eslint-disable */

function bootstrap(js) {
    console.log('Bootstrapping...');

    var scriptTag = document.createElement('script');
    scriptTag.src = window.contextJsParameters.contextPath + '/modules/dx-commons-webpack/javascript/apps/commons.bundle.js';
    scriptTag.onload = function () {
        console.log('Common loaded');
        // this ID matches the export entry of 'init.js' in common.bundle.js
        dx_commons_export('c3442d1a6432b2a12854').default(js);
    };

    document.getElementsByTagName('head').item(0).appendChild(scriptTag);
}
