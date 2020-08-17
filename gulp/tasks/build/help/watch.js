const gulp = require('gulp');

gulp.task('help:watch', () =>
    gulp.watch('help/**/*', gulp.series('help'))
);
