module.exports = {
    "env": {
        "node": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        "indent": ["error", 4],
        "linebreak-style": ["error", "unix"],
        "quotes": ["error", "single"],
        "semi": ["error", "always"],
        "no-unused-vars": ["error", { "argsIgnorePattern": "next|req|res" }],
        "no-console": ["warn"],
        "consistent-return": ["error"],
        "eqeqeq": ["error", "always"],
        "no-var": ["error"],
        "prefer-const": ["error"]
    }
};