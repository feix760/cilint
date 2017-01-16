

const fs = require('fs-extra');
const path = require('path');

function copy(from, to) {
    if (!fs.existsSync(to)) {
        fs.copySync(from, to);
        return true;
    }
    return false;
}

const initializer = function() {
    const copys = [
        [ path.join(__dirname, '../conf/cilintrc.js'), '.cilintrc.js'],
        [ path.join(__dirname, '../conf/eslintrc.js'), '.eslintrc.js'],
        [ path.join(__dirname, '../conf/pre-commit'), '.git/hooks/pre-commit']
    ];

    const copyed = [];

    copys.forEach((item) => {
        if (copy(item[0], item[1])) {
            copyed.push(item[1]);
        }
    });

    return {
        copyed
    };
};

module.exports = initializer;
