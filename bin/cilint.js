#!/usr/bin/env node

/**
 * @file Main CLI that is run via the esci command.
 * @author Fishine.Yuan
 */

/* eslint no-console:off */

'use strict';

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
const init = (process.argv.indexOf('--init') > -1),
    debug = (process.argv.indexOf('--debug') > -1);

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const cli = require('../lib/cli');

//------------------------------------------------------------------------------
// Execution
//------------------------------------------------------------------------------

process.once('uncaughtException', err => {

    console.log('Oops! Something went wrong!');
    console.log(err.message);
    console.log(err.stack);

    process.exitCode = 1;
});

if (init) {
    process.exitCode = cli.init(process.argv);
} else {
    process.exitCode = cli.execute(process.argv);
}

