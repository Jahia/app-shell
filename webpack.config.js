const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');

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
            library: 'jahia'
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
            new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|fr|de/),
            new webpack.DllReferencePlugin({manifest: require('./target/manifests/jahia-commons.manifest.json')}),
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
