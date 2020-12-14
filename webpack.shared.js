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
    '@jahia/moonstone-alpha',
    '@jahia/data-helper',

    // Apollo
    '@apollo/react-common',
    '@apollo/react-components',
    '@apollo/react-hooks',

    // DEPRECATED JAHIA PACKAGES
    '@jahia/design-system-kit',
    '@jahia/react-material',
    '@jahia/icons'
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
