// Config i18n : https://react.i18next.com/guides/quick-start
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import XHR from 'i18next-xhr-backend';

const dxContext = window.contextJsParameters;

i18n
    .use(XHR)
    .use(initReactI18next) // Passes i18n down to react-i18next
    .init({
        lng: dxContext.uilang,
        fallbackLng: 'en',
        ns: ['app-shell'],
        defaultNS: 'app-shell',

        interpolation: {
            escapeValue: false // React already safes from xss
        },

        // React i18next special options (optional)
        react: {
            useSuspense: false
        },

        // XHR plugin Section
        backend: {
            loadPath: `${dxContext.contextPath || ''}/modules/{{ns}}/javascript/locales/{{lng}}.json`
        }
    });

export default i18n;
