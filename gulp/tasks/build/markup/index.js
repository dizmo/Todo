const pkg = require('../../../package.js');
const gulp = require('gulp');
const gulp_htmlmin = require('gulp-htmlmin');
const gulp_replace = require('gulp-replace');
const path = require('path');

const api_version = pkg.dizmo &&
    pkg.dizmo.settings && pkg.dizmo.settings['api-version'];
const elm_version = pkg.dizmo &&
    pkg.dizmo.settings && pkg.dizmo.settings['elements-version'];

const rgx_script = (path) => new RegExp(
    `<script([\\s\\S]+)src="/scripts/${path}-([\\.\\d]+).js"([\\s\\S]*)>([\\s\\S]*)</script>`);
const tag_script = (path, ...g) =>
    `<script${g[0]}src="/scripts/${path}-${g[1]}.js"${g[2]}>${g[3]}</script>`;
const rgx_style = (path) => new RegExp(
    `<link([\\s\\S]+)href="/styles/${path}-([\\.\\d]+).css"([\\s\\S]*)>`);
const tag_style = (path, ...g) =>
    `<link${g[0]}href="/styles/${path}-${g[1]}.css"${g[2]}>`;

gulp.task('markup', () => {
    const minify = require('yargs')
        .default('minify').argv.minify;
    const argv = require('yargs')
        .default('htmlmin', minify === true).argv;

    let stream = gulp.src(['src/**/*.html'])
        .pipe(gulp_replace(rgx_script('dizmojs'), (match, ...groups) => {
            if (api_version) groups[1] = api_version;
            return tag_script('dizmojs', ...groups);
        }))
        .pipe(gulp_replace(rgx_script('dizmoelements'), (match, ...groups) => {
            if (elm_version) groups[1] = elm_version;
            return tag_script('dizmoelements', ...groups);
        }))
        .pipe(gulp_replace(rgx_style('dizmoelements'), (match, ...groups) => {
            if (elm_version) groups[1] = elm_version;
            return tag_style('dizmoelements', ...groups);
        }));
    if (typeof argv.htmlmin === 'string') {
        argv.htmlmin = JSON.parse(argv.htmlmin);
    }
    if (typeof argv.htmlmin === 'boolean') {
        argv.htmlmin = {
            collapseWhitespace: argv.htmlmin,
            minifyCSS: argv.htmlmin,
            minifyJS: argv.htmlmin,
            removeComments: argv.htmlmin
        };
    }
    if (argv.htmlmin) {
        stream = stream.pipe(gulp_htmlmin(argv.htmlmin));
    }
    return stream.pipe(gulp.dest(path.join('build', pkg.name)));
});
