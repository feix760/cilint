

const fs = require('fs-extra');
const path = require('path');
const request = require('request');
const requireFromString = require('require-from-string');
const deasync = require('deasync');

const PRECOMMIT_VERSION = '0.0.1';

/**
 * Wget exports from url
 * @param {String} url
 * @return {Object}
 */
function wget(url) {
    return deasync(done => {
        request({
            url,
            timeout: 3000
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                done(null, requireFromString(body));
            } else {
                // TODO log error
                done(null, null);
            }
        });
    })();
}

/**
 * Write rc file
 * @param {String} to
 * @param {...Object} args
 */
function writeRc(to, ...args) {
    const rc = Object.assign({}, ...args);

    fs.writeFileSync(to, `module.exports=${JSON.stringify(rc, null, 4)}`);
}

/**
 * Init cilintrc
 * @param {Object} options
 * @return {?String}
 */
function initCilintrc(options) {
    const rcPath = '.cilintrc.js';

    if (options.override || !fs.existsSync(rcPath)) {
        const url = options.cilintUrl;

        writeRc(rcPath, url ? wget(url) : require('../conf/cilintrc.js'), options.cilintrc);
        return rcPath;
    }
}

/**
 * Init eslintrc
 * @param {Object} options
 * @return {?String}
 */
function initEslintrc(options) {
    const rcPath = '.eslintrc.js';

    if (options.override || !fs.existsSync(rcPath)) {
        const url = options.eslintrcUrl;

        writeRc(rcPath, url ? wget(url) : require('../conf/eslintrc.js'), options.eslintrc);
        return rcPath;
    }
}

/**
 * Init precommit hook
 * @param {Object} options
 * @return {?String}
 */
function initPreCommit(options) {
    const preCommitTo = '.git/hooks/pre-commit';

    const from = path.join(__dirname, '../conf/pre-commit'),
        to = preCommitTo;

    let version;
    if (fs.existsSync(to)) {
        version = fs.readFileSync(to).toString().match(/# CILint PreCommit v([\d\.]+)/) && RegExp.$1;
    }

    // check pre-commit version
    if (options.override || version !== PRECOMMIT_VERSION) {
        fs.copySync(from, to);
        return preCommitTo;
    }
}

/**
 * Initializer
 * @param {Object} options
 * @param {?Boolean} options.override
 * @param {?Object} options.cilintrc
 * @param {?Object} options.eslintrc
 */
const initializer = function(options = {}) {
    const initers = [
        initCilintrc,
        initEslintrc,
        initPreCommit
    ];

    const copyed = [];

    initers.forEach((fn) => {
        const file = fn(options);
        if (file) {
            copyed.push(file);
        }
    });

    return {
        copyed
    };
};

module.exports = initializer;
