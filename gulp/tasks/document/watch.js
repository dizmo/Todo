const gulp = require('gulp');

gulp.task('docs:watch', () =>
    gulp.watch('src/**/*.(js)', gulp.series('docs'))
);
