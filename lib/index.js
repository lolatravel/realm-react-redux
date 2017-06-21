'use strict';

exports.__esModule = true;
exports.realmConnect = exports.RealmProvider = exports.compose = exports.applyMiddleware = exports.bindActionCreators = exports.combineWriters = exports.createRealmStore = undefined;

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

var _writer = require('./writer');

var _writer2 = _interopRequireDefault(_writer);

var _actions = require('./actions');

var _actions2 = _interopRequireDefault(_actions);

var _middleware = require('./middleware');

var _middleware2 = _interopRequireDefault(_middleware);

var _compose = require('./compose');

var _compose2 = _interopRequireDefault(_compose);

var _warning = require('./utils/warning');

var _warning2 = _interopRequireDefault(_warning);

var _connect = require('./connect');

var _provider = require('./provider');

var _provider2 = _interopRequireDefault(_provider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
* This is a dummy function to check if the function name has been altered by minification.
* If the function has been minified and NODE_ENV !== 'production', warn the user.
*/
function isCrushed() {}

if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  (0, _warning2.default)('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
}

exports.createRealmStore = _store2.default;
exports.combineWriters = _writer2.default;
exports.bindActionCreators = _actions2.default;
exports.applyMiddleware = _middleware2.default;
exports.compose = _compose2.default;
exports.RealmProvider = _provider2.default;
exports.realmConnect = _connect.realmConnect;