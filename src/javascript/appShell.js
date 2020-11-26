import ReactDOM from 'react-dom';
import {registry} from '@jahia/ui-extender';

function loadComponent(container, module) {
    return async () => {
        // Initializes the shared scope. Fills it with known provided modules from this build and all remotes
        await __webpack_init_sharing__('default');
        // const container = window[scope]; // or get the container somewhere else
        // Initialize the container, it may provide shared modules
        await container.init(__webpack_share_scopes__.default);
        try {
            const factory = await container.get(module);
            const Module = factory();
            return Module;
        } catch (e) {
            console.log("No init() found in container", container);
        }
    };
}

const promisifiedReactDomRender = (cmp, target) => {
    return new Promise(resolve => {
        ReactDOM.render(cmp, target, resolve);
    });
};

export const startAppShell = (remotes, targetId) => {
    // Load main scripts for each bundle
    return Promise.all(Object.values(remotes).map(r => loadComponent(r, './init')()))
        .then(async (inits) => {
            inits.forEach(init => init.default());

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
                        .map(entry => entry.callback())
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
