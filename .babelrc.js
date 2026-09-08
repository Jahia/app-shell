// Babel exists here for one reason: compiling JSX. There is deliberately no
// @babel/preset-env -- the app-shell targets evergreen browsers, so the source's
// async/await, arrow functions and dynamic import() ship untransformed (webpack parses
// them natively, and webpack.config.js sets target: ['web', 'es2022'] so webpack does not
// downgrade its own runtime either).
module.exports = {
    presets: [
        // `development` is left to Babel's NODE_ENV default here, which is correct for jest
        // (NODE_ENV=test -> the dev JSX runtime, where jsxDEV genuinely exists). The webpack
        // build overrides it from argv.mode instead -- see webpack.config.js.
        ['@babel/preset-react', {runtime: 'automatic'}]
    ],
    env: {
        // jest runs CommonJS, so ESM has to be converted -- for tests only. This is
        // module-format conversion, not syntax downgrading: the browser bundle keeps its
        // native ESM and modern syntax. babel-loader resolves envName from NODE_ENV, which
        // the webpack builds leave unset, so this block never applies to them.
        test: {
            plugins: ['@babel/plugin-transform-modules-commonjs']
        }
    }
};
