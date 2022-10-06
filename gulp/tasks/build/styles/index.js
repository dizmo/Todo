const cli = require('../../../tools/cli.js');
const pkg = require('../../../package.js');
const gulp = require('gulp');
const gulp_sass = require('gulp-dart-sass');
const gulp_sourcemaps = require('gulp-sourcemaps');
const path = require('path');

gulp.task('styles:copy', () =>
    gulp.src(['source/styles/**/*', '!source/styles/**/*.scss'], { base: 'source' })
        .pipe(gulp.dest(path.join('build', pkg.name)))
);
gulp.task('styles:sass', () => {
    const minify = require('yargs')
        .default('minify', cli.arg('minify', true))
        .argv.minify;
    const argv = require('yargs')
        .default('sourcemaps', false)
        .default('sass', minify === true)
        .argv;
    let stream = gulp.src(['source/styles/**/*.scss']);
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
        stream = stream.pipe(gulp_sourcemaps.init({
            loadMaps: true, ...argv.sourcemaps
        }));
    }
    if (typeof argv.sass === 'string') {
        argv.sass = JSON.parse(argv.sass);
    }
    if (typeof argv.sass === 'boolean') {
        argv.sass = { outputStyle: argv.sass ? 'compressed' : 'expanded' };
    }
    if (argv.sass || argv.sass === undefined) {
        stream = stream.pipe(gulp_sass({
            outputStyle: 'compressed', ...argv.sass
        }).on('error', gulp_sass.logError));
    }
    if (argv.sourcemaps &&
        argv.sourcemaps.devtool &&
        argv.sourcemaps.devtool !== 'none'
    ) {
        stream = stream.pipe(gulp_sourcemaps.write('./'));
    }
    return stream.pipe(gulp.dest(path.join('build', pkg.name, 'styles')));
});
gulp.task('styles', gulp.series(
    'styles:copy', 'styles:sass'
));
