import('./bootstrap').then(res => {
    console.log(res);
    window.jahia = res;
    res.startAppShell(window.appShell.remotes, window.appShell.targetId);
});
