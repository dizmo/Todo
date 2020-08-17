const pkg = require('../../../package.js');
const gulp = require('gulp');
const gulp_plist = require('gulp-plist');
const gulp_rename = require('gulp-rename');
const path = require('path');

const upper_first = (string = '') => {
    if (string.length > 0) {
        string = (string[0]).toUpperCase() + string.slice(1);
    }
    return string;
};
const camel_case = (string = '') => {
    return string.split(/\W|_/).map(upper_first).join('');
};
const map_keys = (object, map) => {
    return Object.entries(object).reduce((acc, [k, v]) => ({
        ...acc, [map(k, v)]: v
    }), {});
};
gulp.task('properties', (done) => {
    const settings = map_keys(pkg.dizmo.settings, camel_case);
    return gulp.src('.info.plist')
        .pipe(gulp_plist.default(settings))
        .pipe(gulp_rename('Info.plist'))
        .pipe(gulp.dest(path.join('build', pkg.name)));
});
