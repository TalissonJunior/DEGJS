const TSLintPlugin = require('tslint-webpack-plugin');

module.exports = {
    entry: './src/app.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
        new TSLintPlugin({
            files: ['./src/**/*.ts']
        })
    ],
    output: {
        library: 'DEG',
        libraryTarget: 'var'
    }
};