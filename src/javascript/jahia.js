// eslint-disable-next-line no-undef, camelcase
__webpack_public_path__ = `${window.contextJsParameters.contextPath}/modules/dx-commons-webpack/javascript/apps/`;

// Configuration
import './apollo/register';
import './redux/register';

// Global values to expose in Jahia library
import {startAppShell} from './appShell';
import * as uiExtender from '@jahia/ui-extender';
import i18n from './i18n/i18n';
import * as moonstone from '@jahia/moonstone';

// Theses value will be exposed in window.jahia
export {
    startAppShell,
    i18n,
    uiExtender,
    moonstone
};
