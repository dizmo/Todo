const cli = require('../../../tools/cli.js');
const pkg = require('../../../package.js');
const gulp = require('gulp');
const path = require('path');

gulp.task('libraries', () => {
    const argv = require('yargs')
        .default('sourcemaps', cli.arg('sourcemaps', true))
        .argv;
    if (typeof argv.sourcemaps === 'string') {
        argv.sourcemaps = JSON.parse(argv.sourcemaps);
    }
    if (typeof argv.sourcemaps === 'boolean') {
        argv.sourcemaps = {
            devtool: argv.sourcemaps ? 'source-map' : undefined
        };
    }
    if (argv.sourcemaps &&
        argv.sourcemaps.devtool &&
        argv.sourcemaps.devtool !== 'none'
    ) {
        return gulp
            .src(['source/lib/**/*'], { base: 'source' })
            .pipe(gulp.dest(path.join('build', pkg.name)));
    } else {
        return gulp
            .src(['source/lib/**/*', '!source/lib/**/*.map'], { base: 'source' })
            .pipe(gulp.dest(path.join('build', pkg.name)));
    }
});
