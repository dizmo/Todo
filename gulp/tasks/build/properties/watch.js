const gulp = require('gulp');

gulp.task('properties:watch', () =>
    gulp.watch('package.json', gulp.series('properties'))
);
