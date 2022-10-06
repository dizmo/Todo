const pkg = require('../../../package.js');
const gulp_zip = require('gulp-zip');
const gulp = require('gulp');

gulp.task('dizmo', () =>
    gulp.src([`build/${pkg.name}/**/*`], { base: 'build' })
        .pipe(gulp_zip(`${pkg.name}-${pkg.version}.dzm`))
        .pipe(gulp.dest('build'))
);
