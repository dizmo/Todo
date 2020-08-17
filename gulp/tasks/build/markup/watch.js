const gulp = require('gulp');

gulp.task('markup:watch', () =>
    gulp.watch('src/**/*.html', gulp.series('markup'))
);
