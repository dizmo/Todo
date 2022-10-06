const gulp = require('gulp');
const gulp_eslint = require('gulp-eslint');

gulp.task('lint', (done) => {
    const argv = require('yargs')
        .default('lint', true)
        .argv;
    if (typeof argv.lint === 'string') {
        argv.lint = JSON.parse(argv.lint);
    }
    if (argv.lint || argv.lint === undefined) {
        return gulp
            .src(['source/**/*.js', '!{source/lib,build,node_modules}/**'])
            .pipe(gulp_eslint({ ...argv.lint }))
            .pipe(gulp_eslint.format());
    } else {
        done();
    }
});
