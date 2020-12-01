import ReactDOM from 'react-dom';
import {registry} from '@jahia/ui-extender';
import {jsload} from './jsloader';

function loadComponent(container, module) {
    return async () => {
        // Initializes the shared scope. Fills it with known provided modules from this build and all remotes

        // eslint-disable-next-line no-undef, camelcase
        await __webpack_init_sharing__('default');

        // Initialize the container, it may provide shared modules
        // eslint-disable-next-line no-undef, camelcase
        await container.init(__webpack_share_scopes__.default);
        try {
            const factory = await container.get(module);
            const Module = factory();
            return Module;
        } catch (e) {
            console.log('No init() found in container {}', container, e);
        }
    };
}

const promisifiedReactDomRender = (cmp, target) => {
    return new Promise(resolve => {
        ReactDOM.render(cmp, target, resolve);
    });
};

export const startAppShell = ({remotes, targetId, oldScripts}) => {
    // Load main scripts for each bundle
    return Promise.all([
        ...Object.values(remotes).map(r => loadComponent(r, './init')()),
        ...oldScripts.map(path => jsload(path))
    ])
        .then(async inits => {
            inits.forEach(init => init?.default());

            const callbacks = registry.find({type: 'callback', target: 'jahiaApp-init'});

            // Get the list of different priority
            const priorities = callbacks
                .map(cb => Number(cb.targets.find(t => t.id === 'jahiaApp-init').priority))
                // Supress duplicate
                .filter((priority, i, prioritiesWithDuplicates) => {
                    return i === prioritiesWithDuplicates.findIndex(c => Number.isNaN(priority) ? Number.isNaN(Number(c)) : Number(c) === priority);
                })
                .sort();

            for (let priority of priorities) {
                // eslint-disable-next-line no-await-in-loop
                await Promise.all(
                    callbacks
                        .filter(entry => {
                            const entryPriority = Number(entry.targets.find(t => t.id === 'jahiaApp-init').priority);
                            if (Number.isNaN(entryPriority) && Number.isNaN(priority)) {
                                return true;
                            }

                            return entryPriority === priority;
                        })
                        .map(entry => entry.callback()?.catch(err => {
                            console.error('Encountered during executing callbackloading and registering module entry {}', entry, err);
                        }))
                );
            }
        })
        .then(() => {
            console.log(registry);
            // Create application
            const apps = registry.find({type: 'app', target: 'root'}).map(m => m.render);
            const render = apps.reduceRight((prevFn, nextFn) => (...args) => nextFn(prevFn(...args)), value => value);

            return promisifiedReactDomRender(render(), document.getElementById(targetId));
        })
        .catch(err => {
            console.error('Encountered during loading and registering modules', err);
            return promisifiedReactDomRender(`Fatal error, contact IT. ${err.message}`, document.getElementById(targetId));
        })
        .then(() => {
            // Everything is load (or not)... let's remove the loader!
            const loader = document.querySelector('.jahia-loader');
            if (loader) {
                loader.remove();
            }
        })
        .catch(err => {
            console.error('Error while render the error...', err);
        });
};
