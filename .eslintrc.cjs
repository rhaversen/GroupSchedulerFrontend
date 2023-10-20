module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "standard-with-typescript",
        "plugin:react/recommended",
        "next/core-web-vitals",
        "plugin:prettier/recommended",
        "prettier"
    ],
    "overrides": [
        {
            "files": ["*.js", "*.jsx", "*.ts", "*.tsx"],  // This will apply the override to all JS and TS files
            "env": {
                "node": true
            },

            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "project": "./tsconfig.json"
    },
    "rules": {
        "indent": ["error", 4], // Standard ESLint indent rule
        "@typescript-eslint/indent": ["error", 4]
    },
    "plugins": [
        "react",
        "prettier"
    ],
    "settings": {
        "react": {
            "version": "detect"  // This will automatically detect and set the React version
        }
    }    
}