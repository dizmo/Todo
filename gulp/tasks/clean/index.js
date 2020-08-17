const gulp = require('gulp');
const rimraf = require('rimraf');

gulp.task('clean', (done) => rimraf('build', done));
