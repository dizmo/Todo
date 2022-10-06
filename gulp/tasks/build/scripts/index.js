const cli = require('../../../tools/cli.js');
const pkg = require('../../../package.js');
const gulp = require('gulp');
const path = require('path');

let webpack_config = require('../../../../webpack.config');
const webpack_stream = require('webpack-stream');
const webpack = require('webpack');

gulp.task('scripts', async () => {
    const argv = require('yargs')
        .default('minify', cli.arg('minify', true))
        .default('obfuscate', cli.arg('obfuscate', true))
        .default('sourcemaps', cli.arg('sourcemaps', true))
        .coerce('webpack', (arg) => {
            const json = JSON.parse(arg || '{}');
            return map(json, (v) => regexify(v));
        }).argv;
    webpack_config = {
        ...webpack_config, ...argv.webpack
    };
    if (typeof argv.sourcemaps === 'string') {
        argv.sourcemaps = JSON.parse(argv.sourcemaps);
    }
    if (typeof argv.sourcemaps === 'boolean') {
        argv.sourcemaps = {
            devtool: argv.sourcemaps ? 'source-map' : undefined
        };
    }
    if (argv.sourcemaps) {
        webpack_config = {
            ...webpack_config, ...argv.sourcemaps
        };
    } else {
        for (const rule of (oc(webpack_config.module, 'rules') || [])) {
            if (`${rule.test}` !== `${/\.(s[ac]ss|css)$/i}`) {
                continue;
            }
            for (const u of (rule.use || [])) {
                if (typeof u.loader === 'string' &&
                    u.loader.match(/s?css-loader$/)
                ) {
                    u.options = {
                        ...u.options, ...{ sourceMap: false }
                    };
                }
            }
        }
    }
    if (typeof argv.obfuscate === 'string') {
        argv.obfuscate = JSON.parse(argv.obfuscate);
    }
    if (typeof argv.obfuscate === 'boolean') {
        argv.obfuscate = argv.obfuscate ? {} : null;
    }
    if (argv.obfuscate) {
        const obfuscator = await cli.npm_i(
            'webpack-obfuscator', 'javascript-obfuscator'
        );
        webpack_config = {
            ...webpack_config, plugins: [
                new obfuscator(argv.obfuscate)
            ]
        };
    }
    if (typeof argv.minify === 'string') {
        argv.minify = JSON.parse(argv.minify);
    }
    if (typeof argv.minify === 'boolean') {
        argv.minify = {
            mode: argv.minify ? 'production' : 'none'
        };
    }
    if (argv.minify) {
        webpack_config = {
            ...webpack_config, ...argv.minify
        };
    }
    return await new Promise((resolve) => webpack_stream(
        webpack_config, webpack, (error, stats) => {
            if (error) console.error(error);
        })
        .pipe(gulp.dest(path.join('build', pkg.name)))
        .on('end', resolve)
    );
});
function map(any, apply) {
    if (any && typeof any === 'object') {
        Object.entries(any).forEach(([k, v]) => {
            any[k] = map(v, apply);
        });
        return any;
    }
    if (Array.isArray(any)) {
        any.forEach((v, i) => {
            any[i] = map(v, apply)
        });
        return any;
    }
    return apply(any);
}
function regexify(value) {
    if (typeof value === 'string') {
        const m = value.match(
            /^\/(?<source>[^\/]+)\/(?<flag>\w*)$/
        );
        if (m && m.groups) {
            value = new RegExp(m.groups.source, m.groups.flag);
        }
    }
    return value;
}
function oc(el, a) {
    return el ? el[a] : undefined;
}
