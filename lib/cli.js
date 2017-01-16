/**
 * @file Main CLI object.
 * @author Fishine.Yuan
 */

'use strict';

/* eslint no-console:off */

const chalk = require('chalk');
const CliEngine = require('./cli-engine');
const initializer = require('./initializer');
const stylish = require('./formatters/stylish');
const options = require("./options");

/**
 * Outputs the results of the linting
 * @param {Array.<Object>} results
 */
function printResults(results) {
    const stdout = stylish(results);
    console.log(stdout ? stdout : 'Cilint pass');
}

/**
 * Encapsulates all CLI behavior for cilint. Makes it easier to test as well as
 * for other Node.js programs to effectively run the CLI.
 */
const cli = {
    /**
     * Executes the CLI based on an array of arguments that is passed in.
     * @param {String|Array|Object} args The arguments to process.
     * @return {Number} The exit code for the operation.
     */
    execute(args) {
        let currentOptions;
        try {
            currentOptions = options.parse(args);
        } catch (error) {
            console.log(error);
            return 1;
        }

        currentOptions.files = currentOptions._ || [];

        // set to current working dir
        if (!currentOptions.files.length) {
            currentOptions.files = ['.'];
        }

        if (currentOptions.help) {
            console.log(options.generateHelp());
            return 0;
        }

        if (currentOptions.init) {
            return this.init(currentOptions);
        }

        return this.lint(currentOptions);
    },

    /**
     * Run init
     * @param {Object} options The argument options to process
     * @return {Number} The exit code for the operation.
     */
    init(options) {
        console.log(chalk.yellow('Cilint init..'));
        const results = initializer();
        results.copyed.forEach((item) => {
            console.log('Generated', chalk.yellow(item));
        });
        console.log(chalk.yellow('Done'));

        return 0;
    },

    /**
     * Run lint
     * @param {Object} options The argument options to process
     * @return {Number} The exit code for the operation.
     */
    lint(options) {
        console.log('Cilint lint code style..');

        const engine = new CliEngine(options);

        const results = engine.getResults();

        printResults(results);

        let errors = 0;

        results.forEach(result => {
            result.messages.forEach(message => {
                if (message.isError) {
                    errors++;
                }
            });
        });

        return engine.rc.stopCommit !== false && errors ? 1 : 0;
    }
};

module.exports = cli;
