export const jsload = path => new Promise((resolve, reject) => {
    const scriptTag = document.createElement('script');
    scriptTag.src = window.contextJsParameters.contextPath + path;
    scriptTag.onload = function () {
        resolve();
    };

    scriptTag.onerror = function () {
        reject(new Error('Error while loading ' + path));
    };

    document
        .getElementsByTagName('head')
        .item(0)
        .appendChild(scriptTag);
});
