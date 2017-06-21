'use strict';

exports.__esModule = true;
exports.whenMapDispatchToPropsIsFunction = whenMapDispatchToPropsIsFunction;
exports.whenMapDispatchToPropsIsMissing = whenMapDispatchToPropsIsMissing;
exports.whenMapDispatchToPropsIsObject = whenMapDispatchToPropsIsObject;

var _actions = require('../actions');

var _actions2 = _interopRequireDefault(_actions);

var _wrapMapToProps = require('./wrapMapToProps');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function whenMapDispatchToPropsIsFunction(mapDispatchToProps) {
    return typeof mapDispatchToProps === 'function' ? (0, _wrapMapToProps.wrapMapToPropsFunc)(mapDispatchToProps, 'mapDispatchToProps') : undefined;
}

function whenMapDispatchToPropsIsMissing(mapDispatchToProps) {
    return !mapDispatchToProps ? (0, _wrapMapToProps.wrapMapToPropsConstant)(function (dispatch) {
        return { dispatch: dispatch };
    }) : undefined;
}

function whenMapDispatchToPropsIsObject(mapDispatchToProps) {
    return mapDispatchToProps && typeof mapDispatchToProps === 'object' ? (0, _wrapMapToProps.wrapMapToPropsConstant)(function (dispatch) {
        return (0, _actions2.default)(mapDispatchToProps, dispatch);
    }) : undefined;
}

exports.default = [whenMapDispatchToPropsIsFunction, whenMapDispatchToPropsIsMissing, whenMapDispatchToPropsIsObject];