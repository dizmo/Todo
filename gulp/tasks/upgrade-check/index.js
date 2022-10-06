const cli = require('../../tools/cli.js');
const ansi_colors = require('ansi-colors');
const fancy_log = require('fancy-log');
const gulp = require('gulp');

const npm_outdated = (...args) => cli.run('npm', 'outdated', ...args)({
    stdio: 'pipe', shell: true
});
const npm_config = (...args) => cli.run('npm', 'config', ...args)({
    stdio: 'pipe', shell: true
});
const if_check = (key, delta = 86400000) => async (now) => {
    const epoch = parseInt(await npm_config('get', `${key}:epoch`)) || 0;
    if (now - epoch > delta) {
        await npm_config('set', `${key}:epoch=${now}`);
        return true;
    }
    return false;
};
const check = async (flag) => {
    if (flag) try {
        return JSON.parse(await npm_outdated(
            'yo', '@dizmo/generator-dizmo', '-g', '--json'
        ));
    } catch (ex) {
        console.error(ex);
    }
    return null;
};
const print = (json, text = 'Generator Upgrade Available', box = {
    width: 57, padding: (offset) => (box.width - text.length) / 2 + (
        offset ? (box.width - text.length) % 2 : 0
    )
}) => {
    if (typeof json !== 'object' || json === null) {
        return;
    }
    fancy_log(`┌${'─'.repeat(box.width)}┐`);
    fancy_log(`│${' '.repeat(box.padding(0)) + ansi_colors.yellow.bold(text) + ' '.repeat(box.padding(1))}│`);
    fancy_log(`└${'─'.repeat(box.width)}┘`);
    for (const [key, item] of Object.entries(json).reverse()) {
        fancy_log(`> ${key} @${item.current}, but latest @${item.latest}; run:`);
        fancy_log(ansi_colors.yellow.bold(`npm upgrade -g ${key}`));
    }
    fancy_log(`> Then to upgrade project run:`);
    fancy_log(ansi_colors.yellow.bold(
        `yo @dizmo/dizmo --upgrade --skip-install`
    ));
    fancy_log(`> For further information see:`);
    fancy_log(ansi_colors.white.bold(
        `https://www.npmjs.com/package/@dizmo/generator-dizmo#upgrading-the-build-system`
    ));
};
gulp.task('upgrade-check', () =>
    if_check('@dizmo/generator-dizmo')(Date.now()).then(check).then(print)
);
