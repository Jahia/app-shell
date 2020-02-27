/* Core dependencies */
require('react');
const ReactDOM = require('react-dom');
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
const uiExtender = require('@jahia/ui-extender');
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

const jsload = path => new Promise(resolve => {
    console.debug(`Load ${path}`);
    let scriptTag = document.createElement('script');
    scriptTag.src = window.contextJsParameters.contextPath + path;
    scriptTag.onload = function () {
        resolve(path);
    };

    document
        .getElementsByTagName('head')
        .item(0)
        .appendChild(scriptTag);
});

export default function (js, appshellmode) {
    if (appshellmode) {
        // Load main scripts for each bundle
        let jsloads = js.map(path => {
            return jsload(path);
        });
        Promise.all(jsloads).then(() => {
            const promises = [];
            // Execute every registration callback
            uiExtender.registry.find({type: 'callback', target: 'jahiaApp-init'}).forEach(entry => promises.push(entry.callback()));

            Promise.all(promises).then(() => {
                // Create application
                const apps = uiExtender.registry.find({type: 'app', target: 'root'}).map(m => m.render);
                const render = apps.reduceRight((prevFn, nextFn) => (...args) => nextFn(prevFn(...args)), value => value);

                // Render
                ReactDOM.render(render(), document.getElementById(window.contextJsParameters.targetId));
            }).catch(() => {
                console.error('Encountered error during callback handling:', promises);
            });
        });
    } else {
        // Legacy loading
        let jsloads = js.slice(0, js.length - 1).map(path => {
            return jsload(path);
        });
        Promise.all(jsloads).then(path => {
            console.debug(`${path} loaded`);
            let appJs = js.slice(js.length - 1);
            jsload(appJs);
        });
    }
}
