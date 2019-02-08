require('@jahia/apollo-dx');
require('@jahia/ds-mui-theme');
require('@jahia/i18next');
require('@jahia/icons');
require('@jahia/layouts');
require('@jahia/react-apollo');
require('@jahia/react-material');
require('@jahia/registry');

/* eslint-disable */
__webpack_public_path__ = window.contextJsParameters.contextPath + '/modules/dx-commons-webpack/javascript/apps/';

function jsload(path) {
    return new Promise(resolve => {
        var scriptTag = document.createElement('script');
        scriptTag.src = window.contextJsParameters.contextPath + path;
        scriptTag.onload = function () {
            resolve();
        };
        document.getElementsByTagName('head').item(0).appendChild(scriptTag);
    });
}

export default function (js) {
    let jsloads = js.slice(0, js.length - 1).map(path => {
        return jsload(path);
    });
    Promise.all(jsloads).then(() => {
        jsload(js.slice(js.length - 1));
    });
}

