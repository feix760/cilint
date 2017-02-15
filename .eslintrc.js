
module.exports = {
    "extends": "airbnb",
    "installedESLint": true,
    "parser": "babel-eslint",
    "env": {
        "node": true
    },
    "plugins": [
    ],
    "rules": {
        "indent": [ "error", 4, { "SwitchCase": 1 } ],
        "comma-dangle": "warn",
        "no-param-reassign": "warn",
        "no-underscore-dangle": "off",
        "no-bitwise": "off",
        "class-methods-use-this": "warn",
        "no-unused-expressions": "warn",
        "keyword-spacing": "warn",
        "consistent-return": "off",
        "one-var": [ "warn", "always" ],
        "arrow-body-style": [ "warn", "as-needed" ],
        "space-before-function-paren": [ "error", "never" ],
        "no-trailing-spaces": [ "error", { "skipBlankLines": true } ]
    }
}
