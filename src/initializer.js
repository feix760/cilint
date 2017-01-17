

const fs = require('fs-extra');
const path = require('path');

const preCommitVersion = '0.0.1';

function copy(from, to) {
    if (!fs.existsSync(to)) {
        fs.copySync(from, to);
        return true;
    }
    return false;
}

const preCommitTo = '.git/hooks/pre-commit';

function copyPreCommit() {
    const from = path.join(__dirname, '../conf/pre-commit'),
        to = preCommitTo;
    let version;
    if (fs.existsSync(to)) {
        version = fs.readFileSync(to).toString().match(/# CILint PreCommit v([\d\.]+)/) && RegExp.$1;
    }

    // check pre-commit version
    if (version !== preCommitVersion) {
        fs.copySync(from, to);
        return true;
    }
    return false;
}

const initializer = function() {
    const copys = [
        [ path.join(__dirname, '../conf/cilintrc.js'), '.cilintrc.js'],
        [ path.join(__dirname, '../conf/eslintrc.js'), '.eslintrc.js'],
    ];

    const copyed = [];

    copys.forEach((item) => {
        if (copy(item[0], item[1])) {
            copyed.push(item[1]);
        }
    });

    if (copyPreCommit()) {
        copyed.push(preCommitTo);
    }

    return {
        copyed
    };
};

module.exports = initializer;
