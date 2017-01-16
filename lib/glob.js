
const Minimatch = require('minimatch').Minimatch;

/**
 * Glob test
 * @param {String|Array.<String>} pattern 
 * @return {Function(String):Boolean} 
 */
const Glob = function(pattern) {
    if (typeof pattern === 'string') {
        return Glob([ pattern ]);
    }

    const tests = pattern.map(p => {
        return {
            isNot: !!p.match(/^!/),
            mm: new Minimatch(p.replace(/^!/, ''))
        };
    });

    return function(path) {
        let is = false;

        tests.forEach((test) => {
            if (test.isNot) {
                if (is && test.mm.match(path)) {
                    is = false;
                }
            } else {
                if (!is && test.mm.match(path)) {
                    is = true;
                }
            }
        });

        return is;
    };
};

module.exports = Glob;

