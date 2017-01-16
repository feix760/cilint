
const fs = require('fs'),
    path = require('path'),
    Engine = require('./engine');

/**
 * Default options
 */
const defaultOptions = {
    cached: false,
    files: []
};

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
        if (fs.existsSync(path.join(dir, '.git'))
            || fs.existsSync(path.join(dir, '.svn'))
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
     * @param {?Array.<String>} options.files lint files
     * @param {Boolean} options.cached 
     */
    constructor(options) {
        options = Object.assign(
            {},
            defaultOptions,
            options
        );

        this.cwd = process.cwd();

        const root = this.root = findProjectRoot(this.cwd);

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
        const engine = new Engine(Object.assign(
            {}, 
            this.options, 
            {
                rc: this.rc,
                cwd: this.cwd,
                root: this.root
            }
        ));

        return engine.getResults();
    }
}

module.exports = CliEngine;

