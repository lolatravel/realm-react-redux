'use strict';

exports.__esModule = true;
exports.whenMapQueriesToPropsIsFunction = whenMapQueriesToPropsIsFunction;
exports.whenMapQueriesToPropsIsMissing = whenMapQueriesToPropsIsMissing;

var _wrapMapToProps = require('./wrapMapToProps');

function whenMapQueriesToPropsIsFunction(mapQueriesToProps) {
    return typeof mapQueriesToProps === 'function' ? (0, _wrapMapToProps.wrapMapToPropsFunc)(mapQueriesToProps, 'mapQueriesToProps') : undefined;
}

function whenMapQueriesToPropsIsMissing(mapQueriesToProps) {
    return !mapQueriesToProps ? (0, _wrapMapToProps.wrapMapToPropsConstant)(function () {
        return {};
    }) : undefined;
}

exports.default = [whenMapQueriesToPropsIsFunction, whenMapQueriesToPropsIsMissing];