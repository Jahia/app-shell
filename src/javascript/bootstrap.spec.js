jest.mock('./i18n/i18n', () => {
    return {
        default: {i18next: true}
    };
});

jest.mock('@jahia/ui-extender', () => {
    return {
        registry: {
            add: jest.fn()
        }
    };
});

jest.mock('./appShell', () => {
    return {
        startAppShell: jest.fn()
    };
});

const uiExtender = require('@jahia/ui-extender');
const startAppShell = require('./appShell').startAppShell;

// eslint-disable-next-line camelcase
global.__webpack_share_scopes__ = {};

describe('jahia lib', () => {
    let jahia;
    beforeEach(() => {
        window.contextJsParameters = {
            contextPath: ''
        };
        // eslint-disable-next-line camelcase
        global.__webpack_public_path__ = '';
        window.jahiaCommons = {};
        jahia = require('./bootstrap');
    });

    it('should expose i18n in window', () => {
        expect(jahia.i18n).toEqual({i18next: true});
    });

    it('should expose uiExtender in window', () => {
        expect(jahia.uiExtender).toBe(uiExtender);
    });

    it('should use the old loader when not in app shell mode', () => {
        expect(jahia.startAppShell).toBe(startAppShell);
    });
});
