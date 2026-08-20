// Load all singletons the federation host (the app-shell) provides to federated remotes
// before loading the remotes themselves, so that the remotes can initialize correctly
import * as react from 'react';
import * as reactJsxRuntime from 'react/jsx-runtime';
import * as reactJsxDevRuntime from 'react/jsx-dev-runtime';
import * as reactDom from 'react-dom';
import * as reactDomClient from 'react-dom/client';
import * as reactRouter from 'react-router';
import * as reactRouterDom from 'react-router-dom';
import * as i18next from 'i18next';
import * as reactI18next from 'react-i18next';
import * as reactRedux from 'react-redux';
import * as redux from 'redux';
import * as apolloClient from '@apollo/client';
import * as uiExtender from '@jahia/ui-extender';

// Not singletons but still federated
import * as moonstone from '@jahia/moonstone';
import * as graphqlTag from 'graphql-tag';

// Even if not read, we export everything so that modules aren't removed by the minifier
export default [
    react,
    reactJsxRuntime,
    reactJsxDevRuntime,
    reactDom,
    reactDomClient,
    reactRouter,
    reactRouterDom,
    i18next,
    reactI18next,
    reactRedux,
    redux,
    apolloClient,
    uiExtender,
    moonstone,
    graphqlTag
];
