const { resolve } = require('path');
module.exports = {
    entry: {
        main: ['core-js/stable', 'regenerator-runtime/runtime', './test/test.js']
    },
    module: {
        rules: [{
            test: /\.js$/i,
            exclude: [/node_modules/i, /\.(min|umd)\.js$/i],
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                    cacheDirectory: true
                }
            }
        }, {
            test: /\.(s[ac]ss|css)$/i,
            use: [{
                loader: 'style-loader',
                options: { insert }
            }, {
                loader: 'css-loader',
                options: { sourceMap: false }
            }, {
                loader: 'sass-loader',
                options: { sourceMap: false }
            }]
        }]
    },
    output: {
        path: resolve(__dirname, 'build', 'my-dizmo.test'),
        environment: { arrowFunction: false },
        filename: 'test.js'
    },
    mode: 'none'
};
function insert(style) {
    const head = document.querySelector('head');
    const links = head.querySelectorAll('link');
    if (links.length > 0) {
        head.insertBefore(style, links[links.length - 1]);
    } else {
        head.append(style);
    }
}
