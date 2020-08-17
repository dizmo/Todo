const gulp = require('gulp');

gulp.task('libraries:watch', () =>
    gulp.watch('src/lib/**/*', gulp.series('libraries'))
);
