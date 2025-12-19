const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
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
            chunkFilename: 'appshell.[id].[contenthash].js'
        },
        resolve: {
            mainFields: ['module', 'main'],
            extensions: ['.mjs', '.js', '.jsx', 'json'],
            alias: {
                'subscriptions-transport-ws': 'subscriptions-transport-ws/dist/client', // This is done to avoid packaging all server nodeJS library because we only need client side,
                'apollo-client': '@apollo/client'
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
                            presets: [
                                ['@babel/preset-env', {
                                    modules: false,
                                    targets: {chrome: '60', edge: '44', firefox: '54', safari: '12'}
                                }],
                                '@babel/preset-react'
                            ],
                            plugins: [
                                'lodash',
                                '@babel/plugin-syntax-dynamic-import'
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
                        'style-loader',
                        'css-loader'
                    ]
                },
                {
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }]
                }
            ]
        },
        plugins: [
            new ModuleFederationPlugin({
                name: 'appShell',
                library: {type: 'var', name: 'appShellRemote'},
                filename: 'remoteEntry.js',
                exposes: {
                    './bootstrap': './src/javascript/bootstrap'
                },
                shared
            }),
            new CleanWebpackPlugin(
                path.resolve(__dirname, 'src/main/resources/javascript/apps/'), {verbose: false}
            ),
            new CycloneDxWebpackPlugin(cycloneDxWebpackPluginOptions)
        ],
        mode: 'development'
    };

    config.devtool = (argv.mode === 'production') ? 'source-map' : 'eval-source-map';

    if (argv.analyze) {
        config.devtool = 'source-map';
        config.plugins.push(new BundleAnalyzerPlugin());
    }

    return config;
};
