const gulp = require('gulp');

gulp.task('styles:watch', () =>
    gulp.watch('src/style/**/*.scss', gulp.series('styles'))
);
