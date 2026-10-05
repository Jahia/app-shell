// Jest only: webpack configures babel-loader itself (webpack.config.js), and leaves NODE_ENV
// unset, so Babel's env is never `test` there.
module.exports = {
    env: {
        test: {
            presets: [['@babel/preset-react', {runtime: 'automatic'}]],
            plugins: ['@babel/plugin-transform-modules-commonjs']
        }
    }
};
