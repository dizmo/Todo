const cli = require('../../tools/cli.js');
const gulp = require('gulp');

const jsdoc = () => cli.npx(
    'jsdoc', '--configure', 'jsdoc.json', 'source'
);
gulp.task('docs', async (done) => {
    await cli.npx('rimraf', 'docs');
    await cli.npm_i('jsdoc').catch(() => null);
    await cli.npm_i('minami').catch(() => null);
    await jsdoc().then(done).catch(console.error);
});
