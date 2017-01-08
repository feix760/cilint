
const child_process = require('child_process');
const path = require('path');
const deasync = require('deasync');
const Glob = require('./Glob');
const DEFAULT_CONFIG = require("../conf/cilint.json").parser;

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
                lines,
                fullpath: path.resolve(filePath),
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

class Engine {
    /**
     * @construtor
     * @param {Object} options 
     * @param {String} options.root project root(has a .git/.svn dir)
     * @param {String} options.cwd current working dir
     * @param {String} options.repo repo type(git|svn)
     * @param {?Array.<String>} options.files lint files
     */
    constructor(options) {
        options = Object.assign(
            Object.create(null),
            { 
                repo: 'git'
            },
            options
        );

        this.options = options;

        this.initConfig();
    }

    /**
     * Read .cilintrc.js to init proj config
     */
    initConfig() {
        const { options } = this;
        let projConfig;
        try {
            projConfig = require(path.jion(options.root, '.cilintrc.js'));
        } catch(ex) {
        }

        this.config = Object.assign({}, DEFAULT_CONFIG, projConfig);
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
            cmd = `git diff --cached ${filesOption.join(' ')}`;
        } else {
            throw new Error('Unsupport repo type', options.repo);
        }

        const diff = child_process.execSync(cmd).toString();

        const ignoreGlob = new Glob(this.config.ignore || []);

        return getModifiedFilesFromDiff(diff).filter((item) => {
            return !ignoreGlob(item.filePath);
        });
    }

    /**
     * Get eslint for js
     * @param {Array.<String>} files
     * @return {Object}
     */
    getEslint(files) {
        return deasync((done) => {
            const cmd = 'eslint -f json ' + files.map(str => `"${str}"`).join(' ');
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
            this.getEslint(js),
        ]);
    }

    /**
     * Get lint results
     * @return {Array.<Object>} 
     */
    getResults() {
        const files = this.getModifiedFiles();

        const paths = files.map(file => file.filePath);

        const lintInfo = this.getLintInfo(paths);

        const results = assignLintToFiles(files, lintInfo);

        return results;
    }
}

module.exports = Engine;
