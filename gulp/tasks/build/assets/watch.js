const gulp = require('gulp');

gulp.task('assets:watch', () =>
    gulp.watch('assets/**/*', gulp.series('assets'))
);
