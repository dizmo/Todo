const assert = require('assert');
const fs = require('fs');
const path = require('path');

function merge(target, source) {
    const result = Object.assign({}, target);
    const object = (item) => {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }
    if (object(target) && object(source)) {
        Object.keys(source).forEach(key => {
            if (object(source[key])) {
                if (!(key in target)) {
                    Object.assign(result, { [key]: source[key] });
                } else {
                    result[key] = merge(target[key], source[key]);
                }
            } else {
                Object.assign(result, { [key]: source[key] });
            }
        });
    }
    return result;
}
function filter(object) {
    if (typeof object === 'object') {
        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                if (object[key] !== '') {
                    object[key] = filter(object[key]);
                } else {
                    delete object[key];
                }
            }
        }
    }
    return object;
}
function get_config(path_to, cfg_json) {
    const cfg_path = path.join(
        path_to, '.generator-dizmo', 'config.json'
    );
    try {
        cfg_json = merge(
            JSON.parse(fs.readFileSync(cfg_path)), cfg_json
        );
    } catch (ex) {
        // pass
    }
    const parsed = path.parse(path_to);
    if (parsed.dir && parsed.base) {
        cfg_json = merge(
            cfg_json, get_config(parsed.dir, cfg_json)
        );
    }
    return cfg_json;
}
const pkg = get_config(
    __dirname, filter(JSON.parse(fs.readFileSync('package.json')))
);
assert(pkg,
    'package JSON required');
assert(pkg && pkg.description,
    'package.description required');
assert(pkg && pkg.name,
    'package.name required');
assert(pkg && pkg.version,
    'package.version required');
assert(pkg && pkg.dizmo,
    'package.dizmo required');
assert(pkg && pkg.dizmo && pkg.dizmo.settings,
    'package.dizmo.settings required');
assert(pkg && pkg.dizmo && pkg.dizmo.settings['bundle-identifier'],
    'package.dizmo.settings.bundle-identifier required');
assert(pkg && pkg.dizmo && pkg.dizmo.settings['bundle-name'],
    'package.dizmo.settings.bundle-name required'
);
pkg.dizmo.settings = {
    'bundle-display-name':
        pkg.dizmo.settings['bundle-name'],
    'bundle-short-version-string':
        pkg.version,
    'bundle-version':
        pkg.version,
    'description':
        pkg.description,
    'tags': [
        ...(pkg.dizmo.settings['tags'] || []), ...(pkg.keywords || [])
    ],
    ...pkg.dizmo.settings
};

module.exports = pkg;
