const pkg = require('../../../package.js');
const gulp = require('gulp');
const gulp_copy = require('gulp-copy');

gulp.task('assets:base', () =>
    gulp.src(['assets/{Icon,Icon-dark,Preview}.*'])
        .pipe(gulp_copy(`build/${pkg.name}/`, { prefix: 1 }))
);
gulp.task('assets:main', () =>
    gulp.src(['assets/**/*', '!assets/{Icon,Icon-dark,Preview}.*'])
        .pipe(gulp_copy(`build/${pkg.name}/assets/`, { prefix: 1 }))
);
gulp.task('assets', gulp.series(
    'assets:base', 'assets:main'
));
