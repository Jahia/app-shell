import {registry} from '@jahia/ui-extender';
import {jsload} from './jsloader';
import {createRoot} from 'react-dom/client';
import React, {useEffect} from 'react';
import PropTypes from 'prop-types';

let remotesLoaded = [];
function loadComponent(container, module, totalSize) {
    return async () => {
        try {
            const factory = await container.get(module);
            remotesLoaded.push(container.name);
            // Show counter in the page
            try {
                document.querySelector('.jahia-loading-loaded').innerHTML = `${container.name}`;
                document.querySelector('.jahia-loading-count').innerHTML = `${remotesLoaded.length} / ${totalSize}`;
                document.querySelector('.jahia-loading_count').classList?.remove('is-hidden');
            } catch (e) {
                console.warn('Not able to update the loading screen', e);
            }

            return {name: container.name, factory: factory()};
        } catch (e) {
            console.log('No init() found in container {}', container, e);
        }
    };
}

const Root = ({callback, children}) => {
    useEffect(() => {
        callback();
    }, [callback]);

    return children;
};

Root.propTypes = {
    callback: PropTypes.func.isRequired,
    children: PropTypes.element.isRequired
};

const promisifiedReactDomRender = (cmp, target) => {
    return new Promise(resolve => {
        const root = createRoot(target);
        root.render(
            <Root callback={resolve}>
                {cmp}
            </Root>
        );
    });
};

export const startAppShell = ({remotes, scripts, targetId}) => {
    if (remotes !== undefined) {
        for (const [key, value] of Object.entries(remotes)) {
            value.name = key;
        }
    }

    // Load main scripts for each bundle
    return Promise.all([
        ...Object.values(remotes || {}).map((r, index, values) => loadComponent(r, './init', values.length)().catch(error => {
            registry.add('modules-error', r, {message: error.message});
            return error;
        })),
        ...(scripts || []).map(path => jsload(path).catch(error => {
            registry.add('scripts-error', path, {message: error.message});
            return error;
        }))
    ])
        .then(async inits => {
            const errors = inits.filter(value => value instanceof Error);
            errors.forEach(error => console.error(error.message));
            inits.filter(value => !(value instanceof Error) && value !== undefined).forEach(init => {
                if (typeof init.factory.default === undefined || typeof init.factory.default !== 'function') {
                    let message = `Module ${init.name} does not expose/contain a default function`;
                    console.error(message);
                    registry.add('modules-error', init.name, {message: message});
                    return;
                }

                return init.factory.default();
            });

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
                            console.error('Encountered during executing callback loading and registering module entry {}', entry, err);
                        }))
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
            document.querySelector('.jahia-loader').remove();
            document.querySelector('.page-error').classList.remove('is-hidden');
            if (window.contextJsParameters.config.operatingMode === 'development') {
                document.querySelector('.page-error-log').innerHTML = err;
            }
        })
        .then(() => {
            // Everything is load (or not)... let's remove the loader!
            const loader = document.querySelector('.jahia-loader');
            if (loader) {
                //  Loader.remove();
            }
        })
        .catch(err => {
            console.error('Error while render the error...', err);
        });
};
