'use strict';

exports.__esModule = true;
exports.default = verifySubselectors;

var _warning = require('../utils/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function verify(selector, methodName, displayName) {
    if (!selector) {
        throw new Error('Unexpected value for ' + methodName + ' in ' + displayName + '.');
    } else if (methodName === 'mapPropsToQueries' || methodName === 'mapQueriesToProps' || methodName === 'mapDispatchToProps') {
        if (!selector.hasOwnProperty('dependsOnOwnProps')) {
            (0, _warning2.default)('The selector for ' + methodName + ' of ' + displayName + ' did not specify a value for dependsOnOwnProps.');
        }
    }
}

function verifySubselectors(mapPropsToQueries, mapQueriesToProps, mapDispatchToProps, mergeProps, displayName) {
    verify(mapPropsToQueries, 'mapPropsToQueries', displayName);
    verify(mapQueriesToProps, 'mapQueriesToProps', displayName);
    verify(mapDispatchToProps, 'mapDispatchToProps', displayName);
    verify(mergeProps, 'mergeProps', displayName);
}