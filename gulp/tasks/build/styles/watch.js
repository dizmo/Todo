const gulp = require('gulp');

gulp.task('styles:watch', () =>
    gulp.watch('source/styles/**/*.scss', gulp.series('styles'))
);
