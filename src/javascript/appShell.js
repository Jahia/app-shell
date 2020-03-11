import ReactDOM from 'react-dom';
import {registry} from '@jahia/ui-extender';
import {jsload} from './jsloader';

const promisifiedReactDomRender = (cmp, target) => {
    return new Promise(resolve => {
        ReactDOM.render(cmp, target, resolve);
    });
};

export const startAppShell = (js, targetId) => {
    // Load main scripts for each bundle
    return Promise.all(js.map(path => jsload(path)))
        .then(async () => {
            const callbacks = registry.find({type: 'callback', target: 'jahiaApp-init'});

            // Get the list of different priority
            const priorities = callbacks
                .map(cb => Number(cb.priority))
                // Supress duplicate
                .filter((priority, i) => {
                    return i === callbacks.findIndex(c => Number.isNaN(priority) ? Number.isNaN(Number(c.priority)) : Number(c.priority) === priority);
                })
                .sort();

            for (let priority of priorities) {
                // eslint-disable-next-line no-await-in-loop
                await Promise.all(
                    callbacks
                        .filter(entry => {
                            const entryPriority = Number(entry.priority);
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
