
const child_process = require('child_process');
const path = require('path');
const deasync = require('deasync');

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

class Engine {
    /**
     * @construtor
     * @param {Object} options 
     */
    construtor(options) {
        this.options = options || {};
    }

    /**
     * Get modified files
     * @return {Object}
     */
    getModifiedFiles() {
        // const diff = child_process.execSync('git diff --cached').toString();
        const diff = child_process.execSync('git diff').toString();

        return getModifiedFilesFromDiff(diff);
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
     * assign lint info to files
     * @param {Array.<Object>} files
     * @param {Object} lintMap
     */
    assignLintToFiles(files, lintMap) {
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
     * Get lint results
     * @return {Array.<Object>} 
     */
    getResults() {
        const files = this.getModifiedFiles();

        const paths = files.map(file => file.filePath);

        const lintInfo = this.getLintInfo(paths);

        const results = this.assignLintToFiles(files, lintInfo);

        return results;
    }
}

module.exports = Engine;
