const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const shared = require('./webpack.shared');
const {CycloneDxWebpackPlugin} = require('@cyclonedx/webpack-plugin');

/** @type {import('@cyclonedx/webpack-plugin').CycloneDxWebpackPluginOptions} */
const cycloneDxWebpackPluginOptions = {
    specVersion: '1.4',
    rootComponentType: 'library',
    outputLocation: './bom',
    validateResults: false
};

console.log('Shared modules configuration', shared);

module.exports = (env, argv) => {
    let config = {
        entry: {
            commons: [
                path.resolve(__dirname, 'src/javascript/jahia')
            ]
        },
        output: {
            path: path.resolve(__dirname, 'src/main/resources/javascript/apps/'),
            filename: 'appshell.js',
            chunkFilename: 'appshell.[id].[contenthash].js',
            clean: true
        },
        resolve: {
            mainFields: ['module', 'main'],
            extensions: ['.mjs', '.js', '.jsx', 'json'],
            alias: {
                'subscriptions-transport-ws': 'subscriptions-transport-ws/dist/client', // This is done to avoid packaging all server nodeJS library because we only need client side,
                'apollo-client': '@apollo/client',
                // Expose a simple shim for `react/jsx-dev-runtime` EVEN IN PROD BUILDS
                // so that remotes compiled with dev JSX still work
                ...(argv.mode === 'production' ? {
                    'react/jsx-dev-runtime$': path.resolve(__dirname, 'src/javascript/reactJsxDevRuntime.js')
                } : {})
            }
        },
        optimization: {
            usedExports: false,
            concatenateModules: false
        },
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    type: 'javascript/auto'
                },
                {
                    test: /\.jsx?$/,
                    type: 'javascript/auto',
                    include: [path.join(__dirname, 'src')],
                    use: {
                        loader: 'babel-loader',
                        options: {
                            // No @babel/preset-env: the app-shell targets evergreen browsers,
                            // Babel is kept solely to compile JSX.
                            presets: [
                                ['@babel/preset-react', {
                                    runtime: 'automatic',
                                    development: argv.mode !== 'production' // Uses NODE_ENV by default, not set here
                                }]
                            ]
                        }
                    }
                },
                {
                    test: /\.jsx?$/,
                    use: ['source-map-loader'],
                    enforce: 'pre'
                },
                {
                    test: /\.css$/i,
                    sideEffects: true,
                    use: [
                        {
                            loader: 'style-loader',
                            options: {
                                attributes: {
                                    styleloader: true
                                }
                            }
                        },
                        {
                            loader: 'css-loader',
                            // css-loader 4+ defaults to esModule: true, which turns Moonstone's
                            // data-URI url() fonts into ESM imports webpack then splits into
                            // their own chunks. CJS interop keeps them inlined in the CSS module.
                            options: {esModule: false}
                        }
                    ]
                },
                {
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'fonts/[name][ext]'
                    }
                }
            ]
        },
        plugins: [
            // Apollo Client >= 3.8 only disables its dev-only behaviour (deep-freezing cache
            // results, verbose invariant messages) when globalThis.__DEV__ is explicitly false.
            new DefinePlugin({
                'globalThis.__DEV__': JSON.stringify(argv.mode !== 'production')
            }),
            new ModuleFederationPlugin({
                name: 'appShell',
                library: {type: 'var', name: 'appShellRemote'},
                filename: 'remoteEntry.js',
                exposes: {
                    './bootstrap': './src/javascript/bootstrap'
                },
                shared
            }),
            new CycloneDxWebpackPlugin(cycloneDxWebpackPluginOptions)
        ],
        // Evergreen browsers only -- keeps webpack from downgrading its own runtime helpers.
        target: ['web', 'es2022'],
        mode: 'development'
    };

    config.devtool = (argv.mode === 'production') ? 'source-map' : 'eval-source-map';

    if (argv.analyze) {
        config.devtool = 'source-map';
        config.plugins.push(new BundleAnalyzerPlugin());
    }

    return config;
};
