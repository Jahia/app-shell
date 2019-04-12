window.displayDXLoadingScreen = function (loadingMessages) {
    var getLoadingLabel = function (loadingMessages) {
        var lang = contextJsParameters && (contextJsParameters.uilang || 'en');
        if (loadingMessages && loadingMessages[lang]) {
            return loadingMessages[lang];
        }

        if (
            window.jahia_gwt_messages &&
            window.jahia_gwt_messages.label_loading
        ) {
            return window.jahia_gwt_messages.label_loading;
        }

        switch (lang) {
            case 'fr':
                return 'Chargement...';
            case 'de':
                return 'Wird geladen...';
            default:
                return 'Loading...';
        }
    };

    var loader = document.createElement('div');
    loader.style.position = 'fixed';
    loader.style.top = '0';
    loader.style.left = '0';
    loader.style.width = '100%';
    loader.style.height = '100%';
    loader.style.height = '100%';
    loader.style.zIndex = '2000';
    loader.style.backgroundColor = 'grey';

    loader.innerHTML =
        '<style>@keyframes loadingBar{0%{width:5%}20%{width:62%}44%{width:85%}80%{width:90%}100%{width:100%}}@keyframes ripple{22%{opacity:0;transform:scale(1)}78%{opacity:.15;transform:scale(160)}100%{opacity:0;transform:scale(180)}}@keyframes bounceLogo{60%{padding-top:2px}}body{font-family:\'Nunito Sans\',sans-serif;margin:0;padding:0}.dx-container{height:100vh;overflow:hidden;width:100%;background-color:#1F262A}.dx-wrapper{width:300px;margin:0 auto;padding:45vh}.dx-logo{width:58px;height:58px;margin:0 auto 40px;position:relative;box-sizing:border-box}.dx-loading,.dx-ripple{position:absolute;background-color:#60717B}.dx-logo svg{margin:0 auto;-webkit-animation:bounceLogo 1.5s infinite;-moz-animation:bounceLogo 1.5s infinite;-o-animation:bounceLogo 1.5s infinite;animation:bounceLogo 1.5s infinite}.dx-ripple{margin-left:-1px;width:10px;height:10px;left:50%;top:43vh;opacity:0;border-radius:50%;-webkit-animation:ripple 1.8s;-moz-animation:ripple 1.8s;-o-animation:ripple 1.8s;animation:ripple 1.8s;animation-delay:.8s}.dx-loading{width:300px;height:4px}.dx-loading-progress{display:block;width:4%;height:4px;position:relative;left:0;top:0;background-color:#E8EBED;-webkit-animation:loadingBar 12s infinite;-moz-animation:loadingBar 12s infinite;-o-animation:loadingBar 12s infinite;animation:loadingBar 12s infinite}.dx-text{padding-top:48px;text-align:center;margin:0;color:#fff}</style>' +
        '<div class="dx-container">\n' +
        '    <div class="dx-wrapper">\n' +
        '        <div class="dx-logo"><svg width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n' +
        '            <rect width="58" height="58" fill="url(#pattern0)"/>\n' +
        '            <defs>\n' +
        '                <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">\n' +
        '                    <use xlink:href="#image0" transform="scale(0.00694444)"/>\n' +
        '                </pattern>\n' +
        '                <image id="image0" width="144" height="144" xlink:href="data:image/png;base64,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"/>\n' +
        '            </defs>\n' +
        '        </svg>\n' +
        '        </div>\n' +
        '        <div class="dx-loading"><span class="dx-loading-progress"></span></div>\n' +
        '        <p class="dx-text">' +
        getLoadingLabel(loadingMessages) +
        '</p>\n' +
        '    </div>\n' +
        '    <div class="dx-ripple"></div>\n' +
        '</div>';

    var body = document.createElement('body');
    document.firstElementChild.appendChild(body);
    body.appendChild(loader);

    var observer = new MutationObserver(function (mutations, o) {
        function getNewNode(tagname, className) {
            var element;
            mutations.forEach(function (m) {
                m.addedNodes.forEach(function (el) {
                    if (
                        el.tagName === tagname &&
                        (!className || el.classList.contains(className))
                    ) {
                        element = el;
                    }
                });
            });
            return element;
        }

        var newbody = getNewNode('BODY');
        if (newbody) {
            newbody.appendChild(loader);
            body.remove();
        }

        var iframe = getNewNode('IFRAME', 'gwt-Frame');

        // This method will at first try to remove the loader with child.remove(), where child is the loader element
        // but as IE doesn't support it, we will try to remove the loader with parent.removeChild(child)
        // but here again IE seams to fail in some cases. so in the worst possible outcome we will just hide the loader
        var removeLoader = function (parent, child) {
            console.log('iframe[className="gwt-Frame"] loaded');
            if (child.remove && typeof child.remove === 'function') {
                child.remove();
            } else if (parent.removeChild && typeof parent.removeChild === 'function') {
                parent.removeChild(child);
            } else {
                child.style.display = 'none';
            }
            o.disconnect();
        };

        if (iframe) {
            console.log('iframe[className="gwt-Frame"] readyState: ' + iframe.contentDocument.readyState);

            // If the readyState is complete we likely missed the load event so let's remove the loading screen
            // https://developer.mozilla.org/en-US/docs/Web/API/Document/readyState
            if (iframe.contentDocument.readyState === 'complete') {
                setTimeout(function () {
                    removeLoader(newbody ? newbody : body, loader);
                }, 3000);
            } else {
                iframe.contentWindow.addEventListener('load', function () {
                    removeLoader(newbody ? newbody : body, loader);
                });
            }
        }
    });

    observer.observe(document.firstElementChild, {
        attributes: false,
        childList: true,
        subtree: true
    });
};
