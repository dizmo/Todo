const cli = require('../../../tools/cli.js');
const pkg = require('../../../package.js');

const gulp = require('gulp');
const path = require('path');

let webpack_config = require('../../../../webpack.config');
const webpack_stream = require('webpack-stream');
const webpack = require('webpack');

gulp.task('scripts', async () => {
    const argv = require('yargs')
        .default('minify')
        .default('obfuscate')
        .default('sourcemaps')
        .default('closure', cli.arg('minify'))
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
    }
    if (typeof argv.obfuscate === 'string') {
        argv.obfuscate = JSON.parse(argv.obfuscate);
    }
    if (typeof argv.obfuscate === 'boolean') {
        argv.obfuscate = argv.obfuscate ? {} : null;
    }
    if (argv.obfuscate) {
        const obfuscator = await cli.npm_i(
            'webpack-obfuscator'
        );
        webpack_config = {
            ...webpack_config, plugins: [
                new obfuscator(argv.obfuscate)
            ]
        };
    }
    if (typeof argv.closure === 'string') {
        argv.closure = argv.closure !== argv.minify
            ? JSON.parse(argv.closure)
            : true;
    }
    if (typeof argv.closure === 'boolean') {
        argv.closure = argv.closure ? {} : null;
    }
    if (argv.closure) {
        const closure = await cli.npm_i(
            'closure-webpack-plugin', 'google-closure-compiler'
        );
        const optimization = {
            minimizer: [
                new closure({ mode: 'STANDARD' }, {
                    ...argv.closure
                })
            ]
        };
        webpack_config = {
            ...webpack_config, optimization
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
