const gulp = require('gulp');

gulp.task('markup:watch', () =>
    gulp.watch('source/**/*.html', gulp.series('markup'))
);
