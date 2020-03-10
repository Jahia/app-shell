const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (env, argv) => {
    const config = {
        context: process.cwd(),
        resolve: {
            extensions: ['.js', '.jsx', '.json', '.less', '.css'],
            modules: [__dirname, 'node_modules']
        },

        entry: {
            library: [
                '@babel/polyfill',
                'react',
                'react-dom',
                'react-router',
                'react-router-dom',
                'react-i18next',
                'i18next',
                'i18next-xhr-backend',
                'graphql-tag',
                'react-apollo',
                'react-redux',
                'redux',
                'rxjs',
                'whatwg-fetch',

                // JAHIA PACKAGES
                '@jahia/ui-extender',
                '@jahia/moonstone',
                '@jahia/data-helper',

                // DEPRECATED JAHIA PACKAGES
                '@jahia/design-system-kit',
                '@jahia/react-material',
                '@jahia/icons'
            ]
        },
        output: {
            filename: 'jahia-commons.dll.js',
            path: path.resolve(__dirname, 'src/main/resources/javascript/commons/'),
            library: 'jahiaCommons'
        },
        module: {
            rules: [
                {
                    test: /\.mjs$/,
                    include: /node_modules/,
                    type: 'javascript/auto'
                },
                {
                    test: /\.jsx?$/,
                    include: [path.join(__dirname, 'src')],
                    loader: 'babel-loader',
                    query: {
                        presets: [
                            ['@babel/preset-env', {modules: false, targets: {chrome: '60', edge: '44', firefox: '54', safari: '12'}}],
                            '@babel/preset-react'
                        ],
                        plugins: [
                            'lodash',
                            '@babel/plugin-syntax-dynamic-import'
                        ]
                    }
                },
                {
                    test: /\.jsx?$/,
                    include: [path.join(__dirname, 'node_modules/@jahia')],
                    loader: 'babel-loader',
                    query: {
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
            new webpack.DllPlugin({
                name: 'jahiaCommons',
                path: 'target/manifests/jahia-commons.manifest.json'
            }),
            new CleanWebpackPlugin(
                path.resolve(__dirname, 'target/manifests'), {verbose: false}
            ),
            new CleanWebpackPlugin(
                path.resolve(__dirname, 'src/main/resources/javascript/commons/'), {verbose: false}
            ),
            new webpack.HashedModuleIdsPlugin({
                hashFunction: 'sha256',
                hashDigest: 'hex',
                hashDigestLength: 20
            })
        ]
    };

    if (argv.analyze) {
        config.devtool = 'source-map';
        config.plugins.push(new BundleAnalyzerPlugin());
    }

    return config;
};
