// React's *production* build of `react/jsx-dev-runtime` is a stub -- it literally exports
// `jsxDEV: undefined` (see react/cjs/react-jsx-dev-runtime.production.min.js). The app-shell
// shares `react/jsx-dev-runtime` as a federation singleton, so a production host hands that
// stub to every remote. Any remote compiled with the *development* automatic JSX runtime
// (Babel, SWC or esbuild, all of which pick dev/prod from NODE_ENV) then calls jsxDEV() and
// dies with "jsxDEV is not a function".
//
// This shim implements jsxDEV on top of the production runtime so those remotes keep working
// against a production app-shell. Only the dev-only extras are lost: element-type validation,
// and the `source`/`self` debug arguments React uses to build component stack frames. A
// production React build has no ReactDebugCurrentFrame to feed those to anyway, which is why
// re-pointing this key at React's real development runtime is not a safe alternative.
import {Fragment, jsx, jsxs} from 'react/jsx-runtime';

export {Fragment};

// Mirrors React's dev signature: jsxDEV(type, props, key, isStaticChildren, source, self).
// `source` and `self` are accepted-and-ignored so remote call sites keep their arity.
export function jsxDEV(type, props, key, isStaticChildren) {
    return isStaticChildren ? jsxs(type, props, key) : jsx(type, props, key);
}
