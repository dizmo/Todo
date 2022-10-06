const cli = require('../../../tools/cli.js');
const pkg = require('../../../package.js');
const gulp = require('gulp');
const gulp_zip = require('gulp-zip');
const path = require('path');

gulp.task('help', (done) => {
    const argv = require('yargs')
        .default('help', cli.arg('help', true))
        .argv;
    if (argv.help !== false) {
        return gulp.src('help/**/*', { base: '.' })
            .pipe(gulp_zip('help.zip'))
            .pipe(gulp.dest(path.join('build', pkg.name)));
    } else {
        done();
    }
});
