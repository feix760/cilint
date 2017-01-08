
'use strict';

const optionator = require('optionator');

module.exports = optionator({
    prepend: 'cilint [options] file.js [file.js] [dir]',
    defaults: {
        concatRepeatedArrays: true,
        mergeRepeatedObjects: true
    },
    options: [
        {
            heading: 'Basic configuration'
        },
        {
            option: "help",
            alias: "h",
            type: "Boolean",
            description: "Show help"
        }
    ]
});
