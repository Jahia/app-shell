const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

const deps = require('./package.json').dependencies;

const singletonDeps = [
    '@apollo/react-common',
    '@apollo/react-components',
    '@apollo/react-hoc',
    '@apollo/react-hooks',
    '@jahia/moonstone',
    'apollo-cache-inmemory',
    'apollo-client',
    'apollo-link',
    'i18next',
    'react',
    'react-apollo',
    'react-router',
    'react-router-dom',
    'react-dom',
    'redux',
    'react-redux'
];

module.exports = (env, argv) => {
    let config = {
        entry: {
            commons: [
                path.resolve(__dirname, 'src/javascript/jahia')
            ]
        },
        output: {
            path: path.resolve(__dirname, 'src/main/resources/javascript/apps/'),
            filename: 'appshell.js'
        },
        resolve: {
            mainFields: ['module', 'main'],
            extensions: ['.mjs', '.js', '.jsx', 'json']
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
                    type: 'javascript/auto',
                    include: [path.join(__dirname, 'node_modules/@jahia')],
                    use: {
                        loader: 'babel-loader',
                        options: {
                            plugins: [
                                'lodash',
                                ['transform-imports', {
                                    '@material-ui/icons': {
                                        // eslint-disable-next-line no-template-curly-in-string
                                        transform: '@material-ui/icons/${member}',
                                        preventFullImport: true
                                    },
                                    'mdi-material-ui': {
                                        // eslint-disable-next-line no-template-curly-in-string
                                        transform: 'mdi-material-ui/${member}',
                                        preventFullImport: true
                                    }
                                }],
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
                shared: {
                    ...deps,
                    ...singletonDeps.reduce((acc, item) => ({
                        ...acc,
                        [item]: {
                            singleton: true,
                            requiredVersion: deps[item]
                        }
                    }), {})
                }
            }),
            new CleanWebpackPlugin(
                path.resolve(__dirname, 'src/main/resources/javascript/apps/'), {verbose: false}
            )
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
