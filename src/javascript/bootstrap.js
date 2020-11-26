// eslint-disable-next-line no-undef, camelcase
// __webpack_public_path__ = `${window.contextJsParameters.contextPath}/modules/app-shell/javascript/apps/`;
// window.jahiaCommons.p = `${window.contextJsParameters.contextPath}/modules/app-shell/javascript/commons/`;

// Configuration
require('./apollo/register');
require('./redux/register');

// Global values to expose in Jahia library
const startAppShell = require('./appShell').startAppShell;
const uiExtender = require('@jahia/ui-extender');
const i18n = require('./i18n/i18n').default;
const moonstone = require('@jahia/moonstone');

// Theses value will be exposed in window.jahia
export {
    startAppShell,
    i18n,
    uiExtender,
    moonstone
};
