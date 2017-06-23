'use strict';

exports.__esModule = true;
exports.default = wrapActionCreators;

var _actions = require('../actions');

var _actions2 = _interopRequireDefault(_actions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function wrapActionCreators(actionCreators) {
  return function (dispatch) {
    return (0, _actions2.default)(actionCreators, dispatch);
  };
}