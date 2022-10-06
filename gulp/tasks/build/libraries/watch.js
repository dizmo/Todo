const gulp = require('gulp');

gulp.task('libraries:watch', () =>
    gulp.watch('source/lib/**/*', gulp.series('libraries'))
);
