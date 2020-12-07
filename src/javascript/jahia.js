import('./bootstrap').then(res => {
    window.jahia = res;
    res.startAppShell(window.appShell);
});
