/* eslint-disable */

function bootstrap(js) {
    console.log('Bootstrapping...');

    var scriptTag = document.createElement('script');
    scriptTag.src = window.contextJsParameters.contextPath + '/modules/dx-commons-webpack/javascript/apps/commons.bundle.js';
    scriptTag.onload = function () {
        console.log('Common loaded');
        // Dx_common_export('ae41f0e0a22f148eb296').default(js);
        dx_commons_export('ae41f0e0a22f148eb296').default(js);
    };

    document.getElementsByTagName('head').item(0).appendChild(scriptTag);
}
