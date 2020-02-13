/* Core dependencies */
require('react');
require('react-dom');
require('react-router');
require('react-router-dom');
require('graphql-tag');
require('react-apollo');
require('react-i18next');
require('react-redux');
require('redux');
require('rxjs');
require('whatwg-fetch');

// Jahia packages
require('@jahia/ui-extender');
require('@jahia/moonstone');
require('@jahia/data-helper');
require('./i18n');
require('./apollo/register');
// DEPRECATED JAHIA PACKAGES
require('@jahia/design-system-kit');
require('@jahia/react-material');
require('@jahia/icons');

// eslint-disable-next-line
__webpack_public_path__ =
    window.contextJsParameters.contextPath +
    '/modules/dx-commons-webpack/javascript/apps/';

function jsload(path) {
    return new Promise(resolve => {
        console.debug(`Load ${path}`);
        var scriptTag = document.createElement('script');
        scriptTag.src = window.contextJsParameters.contextPath + path;
        scriptTag.onload = function () {
            resolve(path);
        };

        document
            .getElementsByTagName('head')
            .item(0)
            .appendChild(scriptTag);
    });
}

export default function (js) {
    let jsloads = js.slice(0, js.length - 1).map(path => {
        return jsload(path);
    });
    Promise.all(jsloads).then(path => {
        console.debug(`${path} loaded`);
        let appJs = js.slice(js.length - 1);
        jsload(appJs);
    });
}
