const cli = require('../../tools/cli.js');
const pkg = require('../../package.js');
const ansi_colors = require('ansi-colors');
const assert = require('assert');
const fancy_log = require('fancy-log');
const fs = require('fs');
const gulp = require('gulp');

const info = (...args) => setTimeout(
    () => fancy_log(ansi_colors.green.bold(...args)), 0);
const warn = (...args) => setTimeout(
    () => fancy_log(ansi_colors.yellow.bold(...args)), 0);
const error = (...args) => setTimeout(
    () => fancy_log(ansi_colors.red.bold(...args)), 0);

gulp.task('upload:send', async (done) => {
    const request = await cli.npm_i('request');
    let host = process.env.DZM_STORE_HOST;
    let user = process.env.DZM_STORE_USER;
    let pass = process.env.DZM_STORE_PASS;
    if (pkg.dizmo && pkg.dizmo.store) {
        host = host || pkg.dizmo.store.host;
        user = user || pkg.dizmo.store.user;
        pass = pass || pkg.dizmo.store.pass;
    }
    const argv = require('yargs')
        .default('host', host)
        .default('user', user)
        .default('pass', pass)
        .default('publish', null)
        .argv;
    if (!argv.host) {
        warn('Upload: DZM_STORE_HOST, package.json:dizmo.store.host or ' +
             '`--host` required!');
        done();
        return;
    }
    if (!argv.user && argv.user !== '') {
        warn('Upload: DZM_STORE_USER, package.json:dizmo.store.user or ' +
             '`--user` required!');
        done();
        return;
    }
    if (!argv.pass && argv.pass !== '') {
        warn('Upload: DZM_STORE_PASS, package.json:dizmo.store.pass or ' +
             '`--pass` required!');
        done();
        return;
    }
    if (!pkg ||
        !pkg.dizmo ||
        !pkg.dizmo.settings ||
        !pkg.dizmo.settings['category']
    ) {
        warn('Upload: package.json:dizmo.settings.category required, ' +
             'e.g. "tools"!');
        done();
        return;
    }

    const dzm_name = `${pkg.name}-${pkg.version}.dzm`;
    const do_login = function () {
        request.post(argv.host + '/v1/oauth/login', {
            body: JSON.stringify({
                username: argv.user, password: argv.pass
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }, on_login);
    };
    const on_login = function (e, res) {
        if (!e && res.statusCode === 200) {
            const set_cookies = res.headers['set-cookie'];
            assert(set_cookies, '"Set-Cookie" header required');
            const set_cookie = set_cookies[0];
            assert(set_cookie, '"Set-Cookie" header empty');
            const session = set_cookie.split(';')[0];
            assert(session, '"Set-Cookie" header invalid');

            if (argv.publish === true) {
                publish_dizmo(session);
            } else {
                post_dizmo(session);
            }
        } else {
            on_error_login.apply(this, arguments);
        }
    };
    const post_dizmo = function (session) {
        if (argv.publish === true) {
            publish_dizmo(session);
        } else {
            request.post(argv.host + '/v1/dizmo', {
                formData: {
                    file: fs.createReadStream('build/' + dzm_name)
                },
                headers: {
                    'Cookie': session
                }
            }, function (e, res) {
                if (!e && res.statusCode === 201) {
                    info(`Upload: transmission to ${argv.host} succeeded.`);
                    publish_dizmo(session);
                } else {
                    put_dizmo(session);
                }
            });
        }
    };
    const put_dizmo = function (session) {
        if (argv.publish === true) {
            publish_dizmo(session);
        } else {
            const bid = pkg.dizmo.settings['bundle-identifier'];
            request.put(argv.host + `/v1/dizmo/${bid}`, {
                formData: {
                    file: fs.createReadStream('build/' + dzm_name)
                },
                headers: {
                    'Cookie': session
                }
            }, function (e, res) {
                if (!e && res.statusCode === 200) {
                    info(`Upload: transmission to ${argv.host} succeeded.`);
                    publish_dizmo(session);
                } else {
                    on_error_upload.apply(this, arguments);
                }
            });
        }
    };
    const publish_dizmo = function (session) {
        if (argv.publish !== false) {
            const bid = pkg.dizmo.settings['bundle-identifier'];
            request.put(argv.host + `/v1/dizmo/${bid}/publish/${pkg.version}`, {
                body: JSON.stringify({
                    publish: true
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': session
                }
            }, function (e, res) {
                if (!e && res.statusCode === 200) {
                    info(`Upload: publication of ${dzm_name} succeeded.`);
                    done();
                } else {
                    on_error_publish.apply(this, arguments);
                }
            });
        }
    };
    const on_error_login = function () {
        warn(`Upload: sign-in to ${argv.host} failed!`);
        on_error.apply(this, arguments);
    };
    const on_error_upload = function () {
        warn(`Upload: transmission to ${argv.host} failed!`);
        on_error.apply(this, arguments);
    };
    const on_error_publish = function () {
        warn(`Upload: publication of ${dzm_name} failed!`);
        on_error.apply(this, arguments);
    };
    const on_error = function (e, res, body) {
        if (e) try {
            error(e, res.toJSON());
        } catch (ex) {
            error(e);
        } finally {
            done();
        }
        else if (body) try {
            const { errormessage: m, errornumber: n } = JSON.parse(body);
            if (m === undefined || n === undefined) {
                error(JSON.stringify(JSON.parse(body), null, 4));
            } else {
                error(`${m} [${n}]`);
            }
        } catch (ex) {
            error(body);
        } finally {
            done();
        }
        else try {
            error(res.toJSON());
        } catch (ex) {
            error(res);
        } finally {
            done();
        }
        setTimeout(
            () => process.exit(-1), 0
        );
    };
    do_login();
});
gulp.task('upload', gulp.series(
    'build', 'upload:send'
));
