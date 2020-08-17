const gulp = require('gulp');

require('../build/watch');
require('../deploy/watch');
require('../document/watch');

gulp.task('watch', gulp.series('build', gulp.parallel(
    'build:watch', 'deploy:watch', 'docs:watch'
)));
