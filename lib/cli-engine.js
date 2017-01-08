
const Engine = require('./engine');

class CliEngine {
    /**
     * @construtor
     * @param {Object} options 
     */
    construtor(options) {
        this.options = options || {};
    }

    /**
     * Get lint results
     * @return {Array.<Object>} 
     */
    getResults() {
        const engine = new Engine();

        return engine.getResults();
    }
}

module.exports = CliEngine;

