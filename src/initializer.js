
const fs = require('fs-extra');
const path = require('path');
const request = require('request');
const requireFromString = require('require-from-string');
const deasync = require('deasync');

const PRECOMMIT_VERSION = '0.0.1';

/**
 * Wget text from url
 * @param {String} url
 * @return {String}
 */
function wget(url) {
    return deasync(done => {
        request({
            url,
            timeout: 3000
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                done(null, body);
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

    fs.writeFileSync(to, `module.exports = ${JSON.stringify(rc, null, 4)}`);
}

/**
 * Init cilintrc
 * @param {Object} options
 * @return {?String}
 */
function initCilintrc(options) {
    const rcPath = '.cilintrc.js';

    if (options.override || !fs.existsSync(rcPath)) {
        const url = options.cilintrcUrl;

        if (url) {
            const text = wget(url);
            if (text) {
                writeRc(rcPath, requireFromString(text), options.cilintrc);
                return rcPath;
            }
        } else {
            writeRc(rcPath, require('../conf/cilintrc.js'), options.cilintrc);
            return rcPath;
        }
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

        if (url) {
            const text = wget(url);
            if (text) {
                writeRc(rcPath, requireFromString(text), options.eslintrc);
                return rcPath;
            }
        } else {
            writeRc(rcPath, require('../conf/eslintrc.js'), options.eslintrc);
            return rcPath;
        }
    }
}

/**
 * Init editorconfig
 * @param {Object} options
 * @return {?String}
 */
function initEditorconfig(options) {
    const rcPath = '.editorconfig';

    if (options.override || !fs.existsSync(rcPath)) {
        const url = options.editorconfigUrl;

        if (url) {
            const text = wget(url);
            if (text) {
                fs.writeFileSync(rcPath, text);
                return rcPath;
            }
        } else {
            fs.writeFileSync(
                rcPath,
                fs.readFileSync(path.join(__dirname, '../conf/editorconfig'))
            );
            return rcPath;
        }
    }
}

/**
 * Init precommit hook
 * @param {Object} options
 * @return {?String}
 */
function initPreCommit(options) {
    const from = path.join(__dirname, '../conf/pre-commit');
    const to = '.git/hooks/pre-commit';

    let version;
    if (fs.existsSync(to)) {
        version = fs.readFileSync(to).toString().match(/# CILint PreCommit v([\d\.]+)/) && RegExp.$1;
    }

    // check pre-commit version
    if (version !== PRECOMMIT_VERSION) {
        fs.copySync(from, to);
        return to;
    }
}

/**
 * Initializer
 * @param {Object} options
 * @param {?Boolean} options.override
 * @param {?Object} options.cilintrc
 * @param {?String} options.cilintrcUrl
 * @param {?Object} options.eslintrc
 * @param {?String} options.eslintrcUrl
 * @param {?String} options.editorconfigUrl
 * @return {Object}
 */
const initializer = function(options = {}) {
    const initers = [
        initCilintrc,
        initEslintrc,
        initEditorconfig,
        initPreCommit,
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
