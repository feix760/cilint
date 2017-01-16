
const child_process = require('child_process');
const path = require('path');
const deasync = require('deasync');
const relative = require('require-relative');
const Glob = require('./glob');
const DEFAULT_RC = require('../conf/cilintrc.js');

/**
 * Diff stdout expr
 * @type {RegExp}
 */
const DIFF_REG = /(\n|^)diff --git a\/(\S+) b\/\2[\s\S]*?\n\+\+\+[^\n]*((\n[ +\-@][^\n]*)*)/gi;

/**
 * Modified region expr
 * @type {RegExp}
 */
const MODIFY_REG = /\n@@ -(\d+),\d+ \+(\d+),\d+ @@[^\n]*((\n[ \-+][^\n]*)*)/gi;

/**
 * Get modified lines for sign file
 * @param {String} modify
 * @return {Array.<Number>}
 */
function getModifiedLines(modify) {
    const lines = [];
    let match = null;
    while (match = MODIFY_REG.exec(modify)) {
        const text = match[3];
        let newline = +match[2];
        text.replace(/^\n/, '').split(/\n/).forEach((line) => {
            if (line.match(/^\+/)) {
                lines.push(newline);
            }
            if (!line.match(/^-/)) {
                newline++;
            }
        });
    }
    return lines;
}

/**
 * Get modified files from diff
 * @param {String} diff
 * @return {Object}
 */
function getModifiedFilesFromDiff(diff) {
    const files = [];
    let match = null;
    while (match = DIFF_REG.exec(diff)) {
        const filePath = match[2];
        const modify = match[3];
        const lines = getModifiedLines(modify);

        if (lines.length) {
            files.push({
                filePath,
                lines
            });
        }
    }
    return files;
}

/**
 * assign lint info to files
 * @param {Array.<Object>} files
 * @param {Object} lintMap
 */
function assignLintToFiles(files, lintMap) {
    return files.map((file) => {
        const lint = lintMap[file.fullpath] || {
            messages: [],
        };
        return Object.assign({}, file, {
            // 过滤非新增行
            messages: lint.messages.filter(msg => file.lines.indexOf(msg.line) !== -1),
        });
    });
}

/**
 * Get eslint commend
 * @param {String} root
 * @return {String}
 */
function getEslintCmd(root) {
    let eslint;
    try {
        eslint = relative.resolve('eslint/bin/eslint', root);
    } catch(ex) {
    }

    if (!eslint) {
        try {
            eslint = relative.resolve('eslint/bin/eslint');
        } catch(ex) {
        }
    }
    
    return eslint || null;
}

class Engine {
    /**
     * @construtor
     * @param {Object} options 
     * @param {String} options.root project root(has a .git/.svn dir)
     * @param {String} options.cwd current working dir
     * @param {String} options.repo repo type(git|svn)
     * @param {Boolean} options.cached cached git --cached
     * @param {Object} options.rc rc rc config
     * @param {?Array.<String>} options.files lint files
     */
    constructor(options) {
        options = Object.assign(
            Object.create(null),
            { 
                repo: 'git',
                cached: false,
                cwd: process.cwd()
            },
            options
        );

        this.options = options;

        this.initRc();
    }

    /**
     * Read `.cilintrc.js`
     */
    initRc() {
        const { options } = this;

        // use options's rc
        if (options.rc) {
            this.rc = options.rc;
            return;
        }

        let rc;
        try {
            rc = require(path.jion(options.root, '.cilintrc.js'));
        } catch(ex) {
        }

        this.rc = Object.assign({}, DEFAULT_RC, rc);
    }

    /**
     * Get modified files
     * @return {Object}
     */
    getModifiedFiles() {
        const { options } = this;
        const filesOption = (options.files || []).map(str => `"${str}"`);

        let cmd;
        if (options.repo === 'svn') {
            cmd = `svn diff ${filesOption.join(' ')}`;
        } else if (options.repo === 'git') {
            cmd = `git diff ${options.cached ? '--cached' : ''} ${filesOption.join(' ')}`;
        } else {
            throw new Error('Unsupport repo type', options.repo);
        }

        const diff = child_process.execSync(cmd).toString();

        const ignoreGlob = new Glob(this.rc.ignore || []);

        return getModifiedFilesFromDiff(diff)
            .map((item) => {
                // filePath是相对仓库根目录的
                // fullpath绝对路径
                item.fullpath = path.resolve(options.root, item.filePath);
                // subpath相对cwd
                item.cwdpath = item.fullpath.replace(options.cwd.replace(/[\/\\]?$/, path.sep), '');
                return item;
            })
            .filter((item) => {
                return !ignoreGlob(item.filePath);
            });
    }

    /**
     * Get eslint for js
     * @param {Array.<String>} files
     * @return {Object}
     */
    getEslint(files) {
        const eslintCmd = getEslintCmd(this.options.root);

        if (!eslintCmd) {
            throw new Error('Could not find eslint');
        }

        return deasync((done) => {
            const cmd = `${eslintCmd} -f json ${files.map(str => `"${str}"`).join(' ')}`;
            // eslint如果有错误child_process会exit=1, 此时如果使用execSync会抛异常
            child_process.exec(cmd, (error, stdout) => {
                let lint = [];
                try {
                    lint = JSON.parse(stdout.toString()) || [];
                } catch(ex) {
                }
                const ret = {};
                lint.forEach((item) => {
                    item.messages.forEach((msg) => {
                        msg.isError = msg.severity > 1 || msg.fatal;
                    });

                    ret[item.filePath] = {
                        messages: item.messages,
                    };
                });
                done(null, ret);
            });
        })();
    }

    /**
     * Get lint for files
     * @param {Array.<String>} files
     * @return {Object}
     */
    getLintInfo(files) {
        const js = files.filter(item => item.match(/\.js$/));
        return Object.assign(...[
            js.length ? this.getEslint(js) : [],
        ]);
    }

    /**
     * Get lint results
     * @return {Array.<Object>} 
     */
    getResults() {
        const files = this.getModifiedFiles();

        const paths = files.map(file => file.cwdpath);

        const lintInfo = this.getLintInfo(paths);

        const results = assignLintToFiles(files, lintInfo);

        return results;
    }
}

module.exports = Engine;
