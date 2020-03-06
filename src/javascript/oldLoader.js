import {jsload} from './jsloader';

export const load = js => {
    // Legacy loading
    const jsloads = js
        .slice(0, js.length - 1)
        .map(path => jsload(path));

    Promise.all(jsloads)
        .then(() => {
            const appJs = js.slice(js.length - 1);
            return jsload(appJs);
        })
        .catch(err => {
            console.error('Encountered error during loading', err);
        });
};
