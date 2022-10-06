const cli = require('./cli');
const fs = require('fs').promises;

const run_task = () => {
    const args = ['--no-warnings', './node_modules/gulp/bin/gulp.js'];
    args.push(...process.argv.slice(2));
    const run = cli.run('node', ...args)();
    run.catch(process.exit);
};

fs.access('./node_modules').then(run_task).catch(() => {
    const Spinner = require('./cli-spinner');
    const spinner = new Spinner('%s installing dependencies: .. ');
    cli.npm('install', '--no-optional').then(() => {
        spinner.stop(true);
        run_task();
    });
    spinner.start();
});
