export const jsload = path => new Promise(resolve => {
    const scriptTag = document.createElement('script');
    scriptTag.src = window.contextJsParameters.contextPath + path;
    scriptTag.onload = function () {
        resolve(path);
    };

    document
        .getElementsByTagName('head')
        .item(0)
        .appendChild(scriptTag);
});
