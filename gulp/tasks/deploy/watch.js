const pkg = require('../../package.js');
const gulp = require('gulp');

gulp.task('deploy:watch', () =>
    gulp.watch(`build/${pkg.name}/**/*`, gulp.series(
        'deploy:only'
    ))
);
