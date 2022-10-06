const gulp = require('gulp');

require('../version-check');
require('../upgrade-check');

gulp.task('prebuild', gulp.series(
    'version-check', 'upgrade-check'
));
