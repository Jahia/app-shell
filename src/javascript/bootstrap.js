// Configuration
const apolloClient = require('./apollo/register').apolloClient;
require('./redux/register');

// Global values to expose in Jahia library
const startAppShell = require('./appShell').startAppShell;
const uiExtender = require('@jahia/ui-extender');
const i18n = require('./i18n/i18n').default;
const moonstone = require('@jahia/moonstone');

const modules = {};
require('./compat').default(modules);

// Theses value will be exposed in window.jahia
export {
    startAppShell,
    i18n,
    uiExtender,
    moonstone,
    modules,
    apolloClient
};
