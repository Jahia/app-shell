// Config i18n : https://react.i18next.com/guides/quick-start
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

const dxContext = window.contextJsParameters;

i18n
    .use(HttpBackend)
    .use(initReactI18next) // Passes i18n down to react-i18next
    .init({
        lng: dxContext.uilang,
        fallbackLng: 'en',
        ns: ['app-shell'],
        defaultNS: 'app-shell',

        // Every UI module still ships v3-style plural keys (`key_plural` rather than `key_other`)
        // i18next 21 switched to the v4 JSON format, so keep the v3 resolver until those
        // bundles are migrated. Note this option is gone from i18next 24 onwards.
        compatibilityJSON: 'v3',

        interpolation: {
            escapeValue: false // React already safes from xss
        },

        // React i18next special options (optional)
        react: {
            useSuspense: false
        },

        // Backend plugin section
        backend: {
            loadPath: (lngs, namespaces) => {
                const hash = window.jahia?.localeFiles?.[namespaces[0]]?.[lngs[0] + '.json'];
                if (hash) {
                    return `${dxContext.contextPath || ''}/modules/${namespaces}/javascript/locales/${lngs}.v${hash}.json`;
                }

                return `${dxContext.contextPath || ''}/modules/${namespaces}/javascript/locales/${lngs}.json`;
            }
        }
    });

export default i18n;
