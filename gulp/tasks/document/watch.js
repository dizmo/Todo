const gulp = require('gulp');

gulp.task('docs:watch', () =>
    gulp.watch('source/**/*.(js)', gulp.series('docs'))
);
