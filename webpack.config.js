const path = require('path');

module.exports = {
    entry: './src/index.ts',
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'client.js',
        path: path.resolve(__dirname, 'public'),
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public')
        },
        compress: true,
        port: 3000,
        historyApiFallback: true
    }
};