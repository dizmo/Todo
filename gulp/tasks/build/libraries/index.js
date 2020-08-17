const pkg = require('../../../package.js');
const gulp = require('gulp');
const path = require('path');

gulp.task('libraries', () => {
    const argv = require('yargs')
        .default('sourcemaps').argv;

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
        return gulp.src(['src/lib/**/*'], { base: 'src' })
            .pipe(gulp.dest(path.join('build', pkg.name)));
    } else {
        return gulp.src(['src/lib/**/*', '!src/lib/**/*.map'], { base: 'src' })
            .pipe(gulp.dest(path.join('build', pkg.name)));
    }
});
