const { access } = require('fs').promises;
const { spawn } = require('child_process');

const arg = (key, lhs, rhs) => (fallback, { argv } = require('yargs')) => {
    const value = argv[key] !== undefined ? argv[key] : fallback;
    return value ? lhs === undefined ? value : lhs : rhs;
};
const run = (command, ...args) => (options = {}) =>
    new Promise((resolve, reject) =>{
        const child = spawn(command, args, {
            shell: false, stdio: 'inherit', ...options
        }).on('exit', code => {
            return (code === 0 ? resolve : reject)(code);
        });
        if (child.stdout) child.stdout.on('data', data => {
            resolve(data.toString('utf8'));
        });
    }
);
const npx = (...args) => run('npx', ...args)({
    stdio: 'inherit'
});
const npx_q = (...args) => run('npx', '--quiet', ...args)({
    stdio: 'ignore'
});
const npm = (...args) => run('npm', '--legacy-peer-deps', ...args)({
    stdio: 'ignore'
});
const npm_i = (package, ...args) =>
    access(`./node_modules/${package || ''}`)
        .catch(() => npm('install', package || '', ...args))
        .then((code) => package ? require(package) : code);

module.exports = {
    arg, run, npx, npx_q, npm, npm_i
};
