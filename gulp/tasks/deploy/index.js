const cli = require('../../tools/cli.js');
const pkg = require('../../package.js');

const ansi_colors = require('ansi-colors');
const fancy_log = require('fancy-log');
const fs = require('fs');
const gulp = require('gulp');
const path = require('path');

function to() {
    let deploy_path =
        process.env.DZM_DEPLOY_PATH || pkg.dizmo['deploy-path'];
    if (deploy_path && path.isAbsolute(deploy_path) === false) {
        deploy_path = path.join(process.cwd(), deploy_path);
    }
    if (deploy_path) {
        return path.join(
            deploy_path, pkg.dizmo.settings['bundle-identifier']);
    }
    return null;
}
function deploy(stream, to) {
    if (to) {
        stream.push(gulp.dest(to));
    }
    return stream;
}

gulp.task('deploy:copy', (done) => {
    const stream = deploy([gulp.src(`build/${pkg.name}/**/*`)], to());
    if (to() !== null) {
        setTimeout(() => fancy_log(
            ansi_colors.green.bold(`Deployed to ${to()}.`)
        ), 0);
        if (!fs.existsSync(to())) {
            stream[stream.length - 1].on('finish', () =>
                setTimeout(() => fancy_log(ansi_colors.green.bold(
                    `Drag & drop build/${pkg.name}-x.y.z.dzm onto dizmoViewer!`
                )), 0)
            );
        }
    } else {
        setTimeout(() => {
            fancy_log(ansi_colors.yellow.bold(
                'Neither the $DZM_DEPLOY_PATH environment variable nor the ' +
                '`dizmo/deploy-path` entry in package.json or ~/.generator-' +
                'dizmo/config.json have been set. Hence, the dizmo has not ' +
                'been deployed!'
            ));
            fancy_log(ansi_colors.yellow.bold(
                'It\'s recommended to set the $DZM_DEPLOY_PATH environment ' +
                'variable or the `dizmo/deploy-path` entry in ~/.generator-' +
                'dizmo/config.json to your dizmo deployment path.'
            ));
        }, 0);
    }
    if (stream.length > 1) {
        cli.npm_i('pump').then((pump) => pump(stream, done));
    } else {
        done();
    }
});
gulp.task('deploy', gulp.series(
    'build', 'deploy:copy'
));
gulp.task('deploy:only', (done) => {
    const stream = deploy([gulp.src(
        'build/{0}/**/*'.replace('{0}', pkg.name))
    ], to());
    if (stream.length > 1) {
        cli.npm_i('pump').then((pump) => pump(stream, done));
    } else {
        done();
    }
});
