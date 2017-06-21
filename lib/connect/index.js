'use strict';

exports.__esModule = true;

var _connect = require('./connect');

Object.defineProperty(exports, 'realmConnect', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_connect).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }