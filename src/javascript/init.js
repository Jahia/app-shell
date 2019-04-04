import '@babel/polyfill';

/* eslint-disable */
__webpack_public_path__ =
    window.contextJsParameters.contextPath +
    '/modules/dx-commons-webpack/javascript/apps/';

export default function(js) {
    import('./main').then(main => main.default(js));
}
