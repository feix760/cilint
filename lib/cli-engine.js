
const fs = require('fs'),
    path = require('path'),
    Engine = require('./engine'),
    defaultOptions = require("../conf/cli-options");

/**
 * Find project path
 * @param {String} cwd
 * @return {String} 
 */
function findProjectRoot(cwd) {
    const list = cwd.split(path.sep);
    let root;
    for (let i = 0; i < list.length; i++) {
        let dir = list.slice(0, list.length - i).join(path.sep);
        if (fs.lstatSync(path.join(dir, '.git')).isDirectory()
            || fs.lstatSync(path.join(dir, '.svn')).isDirectory()
            || fs.existsSync(path.join(dir, '.cilintrc.js'))
        ) {
            root = dir;
            break;
        }
    }

    return root;
}

class CliEngine {
    /**
     * @construtor
     * @param {Object} options 
     * @param {String} options.cwd 
     * @param {?String} options.root project root
     * @param {?Array.<String>} options.files lint files
     */
    constructor(options) {
        options = Object.assign(
            Object.create(null),
            defaultOptions,
            { 
                cwd: process.cwd() 
            },
            options
        );

        const root = options.root = options.root || findProjectRoot(options.cwd);

        if (!root) {
            throw new Error('No .cilintrc.js/.git/.svn found');
        }

        // read cilintrc
        const rcPath = path.join(root, '.cilintrc.js');

        if (!fs.existsSync(rcPath)) {
            throw new Error('No .cilintrc.js found on dir ', root);
        }

        try {
            // set rc
            this.rc = require(rcPath);
        } catch(ex) {
            throw new Error('.cilintrc.js parse error', ex.toString());
        }

        this.options = options;
    }

    /**
     * Get lint results
     * @return {Array.<Object>} 
     */
    getResults() {
        const engine = new Engine(this.options);

        return engine.getResults();
    }
}

module.exports = CliEngine;

