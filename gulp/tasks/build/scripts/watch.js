const gulp = require('gulp');

gulp.task('scripts:watch', () =>
    gulp.watch('source/**/*.(js)', gulp.series('scripts'))
);
