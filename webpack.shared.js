const deps = require('./package.json').dependencies;
const reactVersion = require('react/package.json').version;

const sharedDeps = [
    'react',
    'react-dom',
    'react-router',
    'react-i18next',
    'i18next',
    'graphql-tag',
    'react-apollo',
    'react-redux',
    'redux',
    'formik',

    // JAHIA PACKAGES
    '@jahia/ui-extender',
    '@jahia/moonstone',

    // Apollo
    '@apollo/client',
    '@apollo/react-components'
];

const singletonDeps = [
    'react',
    'react-dom',
    'react-router',
    'react-i18next',
    'i18next',
    'react-apollo',
    'react-redux',
    'redux',
    'formik',
    '@jahia/ui-extender',
    '@apollo/react-components',
];

const notImported = [];

module.exports = {
    ...Object.fromEntries(sharedDeps.map(item => [item, {
        requiredVersion: deps[item]
    }])),
    ...Object.fromEntries(singletonDeps.map(item => [item, {
        singleton: true,
        requiredVersion: deps[item]
    }])),

    // Vite remotes add these subpath keys implicitly and inherit
    // react's `import: false`, so the host has to provide them.
    'react/jsx-runtime': {
        singleton: true,
        requiredVersion: deps.react
    },
    'react/jsx-dev-runtime': {
        singleton: true,
        requiredVersion: deps.react,
        // Required because resolves to ./reactJsxDevRuntime.js in production builds, with no package.json nearby
        version: reactVersion
    },
    'react-dom/client': {
        singleton: true,
        requiredVersion: deps['react-dom']
    },

    ...Object.fromEntries(notImported.map(item => [item, {
        import: false,
        requiredVersion: deps[item]
    }]))
};
