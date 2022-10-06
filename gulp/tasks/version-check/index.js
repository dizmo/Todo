const cli = require('../../tools/cli.js');
const ansi_colors = require('ansi-colors');
const fancy_log = require('fancy-log');
const gulp = require('gulp');

const dotted = ({ major, minor, patch }) => `${major}.${minor}.${patch}`;
const npm_version = (...args) => cli.run('npm', 'version', ...args)({
    stdio: 'pipe', shell: true
});
const if_exit = async (lts) => {
    let version;
    try {
        version = JSON.parse(await npm_version('--json'))['node'];
    } catch (ex) {
        console.error(ex);
    }
    const [major, minor, patch] = version
        ? version.split('.').map((n) => parseInt(n)) : [0, 0, 0];
    if (major > lts.major ||
        major === lts.major && minor > lts.minor ||
        major === lts.major && minor === lts.minor && patch >= lts.patch
    ) {
        return [false, lts, { major, minor, patch }];
    }
    return [true, lts, { major, minor, patch }];
};
const print = (
    [flag, lts, version], text = 'Upgrade Node.js Installation', box = {
        width: 57, padding: (offset) => (box.width - text.length) / 2 + (
            offset ? (box.width - text.length) % 2 : 0
        )
    }
) => {
    if (flag && typeof version === 'object' && version !== null) {
        fancy_log(`┌${'─'.repeat(box.width)}┐`);
        fancy_log(`│${' '.repeat(box.padding(0)) + ansi_colors.yellow.bold(text) + ' '.repeat(box.padding(1))}│`);
        fancy_log(`└${'─'.repeat(box.width)}┘`);
    }
    return [flag, lts, version];
};
const exit = ([flag, lts, version]) => {
    if (flag) {
        Error.prepareStackTrace = (e, stack) => {
            return `${ansi_colors.red.bold('Error:')} ${e.message}`;
        };
        throw new Error(`expected Node.js ${
            ansi_colors.yellow.bold('v' + dotted(lts))
        } or higher; found ${
            ansi_colors.yellow.bold('v' + dotted(version))
        }`);
    }
};
gulp.task('version-check', function (done) {
    if_exit({ major: 14, minor: 17, patch: 3 }).then(print).then(exit).then(done);
});