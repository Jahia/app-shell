// eslint-disable-next-line no-undef, camelcase
__webpack_public_path__ = `${window.contextJsParameters.contextPath}/modules/dx-commons-webpack/javascript/apps/`;

// Jahia packages
import * as uiExtenderLib from '@jahia/ui-extender';
import {default as i18next} from './i18n/i18n';
import './apollo/register';
import {load as oldLoader} from './oldLoader';
import {load as loadAppShell} from './appShell';
import * as moonstoneLib from '@jahia/moonstone';

export function startAppShell(js, appshellmode, targetId) {
    if (appshellmode) {
        return loadAppShell(js, targetId);
    }

    oldLoader(js);
}

export const i18n = i18next;
export const uiExtender = uiExtenderLib;
export const moonstone = moonstoneLib;
