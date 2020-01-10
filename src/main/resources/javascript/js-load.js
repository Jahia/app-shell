/* eslint-disable */

function bootstrap(js) {
    var scriptTag = document.createElement('script');
    scriptTag.src = window.contextJsParameters.contextPath + '/modules/dx-commons-webpack/javascript/apps/commons.bundle.js';
    scriptTag.onload = function () {
        // this ID matches the export entry of 'init.js' in common.bundle.js (./src/javascript/init.js = c3442d1a6432b2a12854)
        dx_commons_export('c3442d1a6432b2a12854').default(js);
    };

    document.getElementsByTagName('head').item(0).appendChild(scriptTag);
}
