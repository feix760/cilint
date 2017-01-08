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
    console.log(stdout);
}

/**
 * Encapsulates all CLI behavior for eslint. Makes it easier to test as well as
 * for other Node.js programs to effectively run the CLI.
 */
const cli = {
    /**
     * Init config & hooks for Git
     * @param {String|Array|Object} args The arguments to process.
     * @return {Number} The exit code for the operation.
     */
    init(args) {
        return initializer();
    },

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

        if (currentOptions.help) {
            console.log(options.generateHelp());
            return 0;
        }

        console.log(chalk.yellow('linting..'));

        const engine = new CliEngine(currentOptions);

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

        return errors ? 1 : 0;
    }
};

module.exports = cli;
