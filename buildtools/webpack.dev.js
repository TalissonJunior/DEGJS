const path = require('path');
const merge = require('webpack-merge');
const common = require('../webpack.config.js');
const webpack = require('webpack'); // to access built-in plugins
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // installed via npm

module.exports = merge(common, {
    output: {
        filename: 'deg.js',
        path: path.resolve(__dirname, '../node_modules/.cache/deg'),
        devtoolModuleFilenameTemplate: '[absolute-resource-path]'
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
        new HtmlWebpackPlugin({ template: './src/index.html' }),
    ],  
    devServer: {
        publicPath:path.resolve(__dirname, '../node_modules/.cache/deg')
    },
    mode: 'development',
    devtool: 'source-map'
});