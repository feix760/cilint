#!/usr/bin/env node

/**
 * @file Main CLI that is run via the esci command.
 * @author Fishine.Yuan
 */

/* eslint no-console:off */

'use strict';

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

process.exitCode = cli.execute(process.argv);
