
module.exports = {
    "extends": "airbnb",
    "installedESLint": true,
    "parser": "babel-eslint",
    "env": {
        "browser": true,
        "node": true
    },
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "rules": {
        "indent": ["error", 4, {
            "SwitchCase": 1
        }],
        "comma-dangle": "warn",
        "no-param-reassign": "warn",
        "no-underscore-dangle": "off",
        "no-bitwise": "off",
        "class-methods-use-this": "warn",
        "no-unused-expressions": "warn",
        "keyword-spacing": "warn",
        "consistent-return": "off",
        "one-var": ["warn", "always"],
        "arrow-body-style": ["warn", "as-needed"],
        "space-before-function-paren": ["error", "never"],
        "no-trailing-spaces": ["error", { "skipBlankLines": true }],
        "import/no-absolute-path": "off",
        "import/extensions": "off",
        "import/no-unresolved": "off",
        "import/no-named-as-default-member": "off",
        "import/no-named-as-default": "off",
        "import/no-extraneous-dependencies": "warn",
        "react/prop-types": "off",
        "react/jsx-filename-extension": "off",
        "react/jsx-indent": ["error", 4],
        "react/jsx-indent-props": ["error", 4]
    }
};
