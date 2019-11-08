const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = (env, argv) => {
    let config = {
        entry: {
            commons: ['@babel/polyfill', path.resolve(__dirname, 'src/javascript/main')]
        },
        output: {
            path: path.resolve(__dirname, 'src/main/resources/javascript/apps/'),
            filename: 'commons.bundle.js',
            chunkFilename: '[name].commons.[chunkhash:6].js',
            library: 'dx_commons_export'
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
                            ['@babel/preset-env', {modules: false, targets: {safari: '7', ie: '10'}}],
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
                                    transform: '@material-ui/icons/${member}',
                                    preventFullImport: true
                                },
                                'mdi-material-ui': {
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
                path: 'target/manifests/[name].manifest.json',
                name: 'dx_commons_export'
            }),
            new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|fr|de/),
            new webpack.HashedModuleIdsPlugin({
                hashFunction: 'sha256',
                hashDigest: 'hex',
                hashDigestLength: 20
            })
        ],
        mode: 'development'
    };

    config.devtool = (argv.mode === 'production') ? 'source-map' : 'eval-source-map';

    if (argv.analyze) {
        config.devtool = 'source-map';
        config.plugins.push(new BundleAnalyzerPlugin());
    }

    if (!argv.manifest) {
        config.entry.commons = [path.resolve(__dirname, 'src/javascript/init')];
        config.optimization.splitChunks = {
            maxSize: 400000
        };
        config.plugins.push(new CleanWebpackPlugin(path.resolve(__dirname, 'src/main/resources/javascript/apps/'), {verbose: false}));

    } else {
        config.output.path = path.resolve(__dirname, 'target');
        config.plugins.push(new CleanWebpackPlugin(path.resolve(__dirname, 'target/manifests'), {verbose: false}));
    }

    return config;
};
