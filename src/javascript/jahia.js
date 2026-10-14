__webpack_init_sharing__('default');

console.log('Loading shared modules...');

import('./federatedDeps').then(() => {
    console.log('Initializing remotes...');
    return Promise.all(
        Object.values(globalThis.appShell.remotes || {}).map(container => container.init(__webpack_share_scopes__.default))
    );
}).then(() => {
    console.log('Bootstrapping application...');

    import('./bootstrap').then(res => {
        globalThis.jahia = res;
        res.startAppShell(globalThis.appShell);
    }).catch(e => console.error('Your network may be too slow, some files could not be loaded!', e));
}).catch(e => console.error('There was an error while loading shared modules or remote entries. Your network may be too slow.', e)); // NOSONAR: top-level await would change how the federation entry boots
