// eslint-disable-next-line no-undef
__webpack_init_sharing__('default');

console.log('Initializing remotes ..');
Promise.all([
    // eslint-disable-next-line no-undef, camelcase
    ...Object.values(window.appShell.remotes || {}).map(container => container.init(__webpack_share_scopes__.default))
]).then(() => {
    console.log('Bootstrapping application ..');

    import('./bootstrap').then(res => {
        window.jahia = res;
        res.startAppShell(window.appShell);
    });
});
