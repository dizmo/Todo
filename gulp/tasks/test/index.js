const { npx, npm_i } = require('../../tools/cli');
const pkg = require('../../package.js');
const gulp = require('gulp');

gulp.task(
    'test:build', async () => {
        return npm_i('webpack-cli').then(() => npx('webpack',
            '--config', 'webpack.config.test.js',
            '--stats', 'errors-only'
        )).catch(process.exit);
    }
);
gulp.task(
    'test:run', () => {
        return npm_i('mocha').then(() => npx('mocha',
            '--require', 'jsdom-global/register',
            '--require', 'ignore-styles',
            `build/${pkg.name}.test`,
            '--recursive'
        )).catch(process.exit);
    }
);
gulp.task('test', gulp.series(
    'clean', 'test:build', 'test:run'
));
