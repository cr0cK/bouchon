module.exports = {
  "extends": [
    "airbnb-base",
    "plugin:flowtype/recommended"
  ],
  "env": {
    "jest/globals": true
  },
  "plugins": [
    "flowtype",
    "jest"
  ],
  "rules": {
    "function-paren-newline": "off",
    "import/prefer-default-export": "off"
  }
};
