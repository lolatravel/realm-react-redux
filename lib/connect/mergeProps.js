'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.defaultMergeProps = defaultMergeProps;
exports.wrapMergePropsFunc = wrapMergePropsFunc;
exports.whenMergePropsIsFunction = whenMergePropsIsFunction;
exports.whenMergePropsIsOmitted = whenMergePropsIsOmitted;

var _verify = require('../utils/verify');

function defaultMergeProps(queryProps, dispatchProps, ownProps) {
    return _extends({}, ownProps, queryProps, dispatchProps);
}

function wrapMergePropsFunc(mergeProps) {
    return function initMergePropsProxy(dispatch, _ref) {
        var displayName = _ref.displayName,
            pure = _ref.pure,
            areMergedPropsEqual = _ref.areMergedPropsEqual;

        var hasRunOnce = false;
        var mergedProps = void 0;

        return function mergePropsProxy(queryProps, dispatchProps, ownProps) {
            var nextMergedProps = mergeProps(queryProps, dispatchProps, ownProps);

            if (hasRunOnce) {
                if (!pure || !areMergedPropsEqual(nextMergedProps, mergedProps)) {
                    mergedProps = nextMergedProps;
                }
            } else {
                hasRunOnce = true;
                mergedProps = nextMergedProps;

                if (process.env.NODE_ENV !== 'production') {
                    (0, _verify.verifyPlainObject)(mergedProps, displayName, 'mergeProps');
                }
            }

            return mergedProps;
        };
    };
}

function whenMergePropsIsFunction(mergeProps) {
    return typeof mergeProps === 'function' ? wrapMergePropsFunc(mergeProps) : undefined;
}

function whenMergePropsIsOmitted(mergeProps) {
    return !mergeProps ? function () {
        return defaultMergeProps;
    } : undefined;
}

exports.default = [whenMergePropsIsFunction, whenMergePropsIsOmitted];