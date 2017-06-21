'use strict';

exports.__esModule = true;
exports.whenMapPropsToQueriesIsFunction = whenMapPropsToQueriesIsFunction;
exports.whenMapPropsToQueriesIsMissing = whenMapPropsToQueriesIsMissing;

var _wrapMapToProps = require('./wrapMapToProps');

function whenMapPropsToQueriesIsFunction(mapPropsToQueries) {
    return typeof mapPropsToQueries === 'function' ? (0, _wrapMapToProps.wrapMapToPropsFunc)(mapPropsToQueries, 'mapPropsToQueries') : undefined;
}

function whenMapPropsToQueriesIsMissing(mapPropsToQueries) {
    return !mapPropsToQueries ? (0, _wrapMapToProps.wrapMapToPropsConstant)(function () {
        return [];
    }) : undefined;
}

exports.default = [whenMapPropsToQueriesIsFunction, whenMapPropsToQueriesIsMissing];