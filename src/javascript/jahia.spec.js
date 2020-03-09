jest.mock('./i18n/i18n', () => {
    return {i18next: true};
});

jest.mock('@jahia/ui-extender', () => {
    return {
        registry: {
            add: jest.fn()
        }
    };
});

jest.mock('./oldLoader', () => {
    return {
        load: jest.fn()
    };
});
jest.mock('./appShell', () => {
    return {
        load: jest.fn()
    };
});
import * as uiExtender from '@jahia/ui-extender';
import {load as oldLoader} from './oldLoader';
import {load as newLoader} from './appShell';

describe('jahia', () => {
    let jahia;
    beforeEach(() => {
        window.contextJsParameters = {
            contextPath: ''
        };
        // eslint-disable-next-line camelcase
        global.__webpack_public_path__ = '';
        jahia = require('./jahia');

        oldLoader.mockClear();
        newLoader.mockClear();
    });

    it('should expose i18n in window', () => {
        expect(jahia.i18n).toEqual({i18next: true});
    });

    it('should expose uiExtender in window', () => {
        expect(jahia.uiExtender).toBe(uiExtender);
    });

    it('should use the old loader when not in app shell mode', () => {
        jahia.startAppShell([], false);
        expect(oldLoader).toHaveBeenCalled();
        expect(newLoader).not.toHaveBeenCalled();
    });

    it('should use the old loader when not in app shell mode', () => {
        jahia.startAppShell([], true);
        expect(oldLoader).not.toHaveBeenCalled();
        expect(newLoader).toHaveBeenCalled();
    });
});
