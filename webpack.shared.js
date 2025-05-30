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
    'react-router-dom',
    'react-i18next',
    'i18next',
    'react-apollo',
    'react-redux',
    'redux',
    '@jahia/moonstone',
    '@jahia/ui-extender',
    '@jahia/data-helper',
    '@apollo/react-common',
    '@apollo/react-components',
    '@apollo/react-hooks'
];

const notImported = [];

module.exports = {
    ...sharedDeps.reduce((acc, item) => ({
        ...acc,
        [item]: {
            requiredVersion: deps[item]
        }
    }), {}),
    ...singletonDeps.reduce((acc, item) => ({
        ...acc,
        [item]: {
            singleton: true,
            requiredVersion: deps[item]
        }
    }), {}),
    ...notImported.reduce((acc, item) => ({
        ...acc,
        [item]: {
            import: false,
            requiredVersion: deps[item]
        }
    }), {})
};
