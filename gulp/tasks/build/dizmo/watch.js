const pkg = require('../../../package.js');
const gulp = require('gulp');

gulp.task('dizmo:watch', () =>
    gulp.watch(`build/${pkg.name}/**/*`, gulp.series('dizmo'))
);
