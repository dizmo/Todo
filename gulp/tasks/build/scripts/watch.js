const gulp = require('gulp');

gulp.task('scripts:watch', () =>
    gulp.watch('src/**/*.(js)', gulp.series('scripts'))
);
