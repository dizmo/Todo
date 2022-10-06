const gulp = require('gulp');

require('./gulp/tasks/prebuild');
require('./gulp/tasks/lint');
require('./gulp/tasks/clean');
require('./gulp/tasks/build');
require('./gulp/tasks/deploy');
require('./gulp/tasks/upload');
require('./gulp/tasks/document');
require('./gulp/tasks/watch');
require('./gulp/tasks/test');

gulp.task('default', gulp.series(
    'build'
));
