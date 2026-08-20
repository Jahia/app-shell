const deps = require('./package.json').dependencies;

const sharedDeps = [
    '@babel/polyfill',
    'react',
    'react-dom',
    'react-router',
    'react-router-dom',
    'react-i18next',
    'i18next',
    'i18next-xhr-backend',
    'graphql-tag',
    'react-apollo',
    'react-redux',
    'redux',
    'rxjs',
    'whatwg-fetch',
    'dayjs',
    'formik',

    // JAHIA PACKAGES
    '@jahia/ui-extender',
    '@jahia/moonstone',
    '@jahia/data-helper',

    // Apollo
    '@apollo/client',
    '@apollo/react-common',
    '@apollo/react-components',
    '@apollo/react-hooks',

    // DEPRECATED JAHIA PACKAGES (since 2019)
    // @jahia/design-system-kit is required to provide the 1.2.1 version that fixes an issue with firefox 130 on windows.
    '@jahia/design-system-kit'
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
    '@apollo/react-common',
    '@apollo/react-components',
    '@apollo/react-hooks'
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
        requiredVersion: deps.react
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
