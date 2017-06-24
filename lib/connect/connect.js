'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.createConnect = createConnect;

var _shallowEqual = require('../utils/shallowEqual');

var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

var _connectAdvanced = require('./connectAdvanced');

var _connectAdvanced2 = _interopRequireDefault(_connectAdvanced);

var _mapDispatchToProps = require('./mapDispatchToProps');

var _mapDispatchToProps2 = _interopRequireDefault(_mapDispatchToProps);

var _mapPropsToQueries = require('./mapPropsToQueries');

var _mapPropsToQueries2 = _interopRequireDefault(_mapPropsToQueries);

var _mapQueriesToProps = require('./mapQueriesToProps');

var _mapQueriesToProps2 = _interopRequireDefault(_mapQueriesToProps);

var _mergeProps = require('./mergeProps');

var _mergeProps2 = _interopRequireDefault(_mergeProps);

var _selectorFactory = require('./selectorFactory');

var _selectorFactory2 = _interopRequireDefault(_selectorFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/*
  connect is a facade over connectAdvanced. It turns its args into a compatible
  selectorFactory, which has the signature:

    (dispatch, options) => (nextState, nextOwnProps) => nextFinalProps

  connect passes its args to connectAdvanced as options, which will in turn pass them to
  selectorFactory each time a Connect component instance is instantiated or hot reloaded.

  selectorFactory returns a final props selector from its mapStateToProps,
  mapStateToPropsFactories, mapDispatchToProps, mapDispatchToPropsFactories, mergeProps,
  mergePropsFactories, and pure args.

  The resulting final props selector is called by the Connect component instance whenever
  it receives new props or store state.
 */

function match(arg, factories, name) {
    for (var i = factories.length - 1; i >= 0; i--) {
        var result = factories[i](arg);
        if (result) return result;
    }

    return function (dispatch, options) {
        throw new Error('Invalid value of type ' + typeof arg + ' for ' + name + ' argument when connecting component ' + options.wrappedComponentName + '.');
    };
}

function strictEqual(a, b) {
    return a === b;
}

// createConnect with default args builds the 'official' connect behavior. Calling it with
// different options opens up some testing and extensibility scenarios
function createConnect() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$connectHOC = _ref.connectHOC,
        connectHOC = _ref$connectHOC === undefined ? _connectAdvanced2.default : _ref$connectHOC,
        _ref$mapPropsToQuerie = _ref.mapPropsToQueriesFactories,
        mapPropsToQueriesFactories = _ref$mapPropsToQuerie === undefined ? _mapPropsToQueries2.default : _ref$mapPropsToQuerie,
        _ref$mapQueriesToProp = _ref.mapQueriesToPropsFactories,
        mapQueriesToPropsFactories = _ref$mapQueriesToProp === undefined ? _mapQueriesToProps2.default : _ref$mapQueriesToProp,
        _ref$mapDispatchToPro = _ref.mapDispatchToPropsFactories,
        mapDispatchToPropsFactories = _ref$mapDispatchToPro === undefined ? _mapDispatchToProps2.default : _ref$mapDispatchToPro,
        _ref$mergePropsFactor = _ref.mergePropsFactories,
        mergePropsFactories = _ref$mergePropsFactor === undefined ? _mergeProps2.default : _ref$mergePropsFactor,
        _ref$selectorFactory = _ref.selectorFactory,
        selectorFactory = _ref$selectorFactory === undefined ? _selectorFactory2.default : _ref$selectorFactory;

    return function connect(mapPropsToQueries, mapQueriesToProps, mapDispatchToProps, mergeProps) {
        var _ref2 = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {},
            _ref2$pure = _ref2.pure,
            pure = _ref2$pure === undefined ? true : _ref2$pure,
            _ref2$areOwnPropsEqua = _ref2.areOwnPropsEqual,
            areOwnPropsEqual = _ref2$areOwnPropsEqua === undefined ? _shallowEqual2.default : _ref2$areOwnPropsEqua,
            _ref2$areQueryPropsEq = _ref2.areQueryPropsEqual,
            areQueryPropsEqual = _ref2$areQueryPropsEq === undefined ? _shallowEqual2.default : _ref2$areQueryPropsEq,
            _ref2$areMergedPropsE = _ref2.areMergedPropsEqual,
            areMergedPropsEqual = _ref2$areMergedPropsE === undefined ? _shallowEqual2.default : _ref2$areMergedPropsE,
            extraOptions = _objectWithoutProperties(_ref2, ['pure', 'areOwnPropsEqual', 'areQueryPropsEqual', 'areMergedPropsEqual']);

        var initMapPropsToQueries = match(mapPropsToQueries, mapPropsToQueriesFactories, 'mapPropsToQueries');
        var initMapQueriesToProps = match(mapQueriesToProps, mapQueriesToPropsFactories, 'mapQueriesToProps');
        var initMapDispatchToProps = match(mapDispatchToProps, mapDispatchToPropsFactories, 'mapDispatchToProps');
        var initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps');

        return connectHOC(selectorFactory, _extends({
            // used in error messages
            methodName: 'connect',

            // used to compute Connect's displayName from the wrapped component's displayName.
            getDisplayName: function getDisplayName(name) {
                return 'Connect(' + name + ')';
            },

            // if mapStateToProps is falsy, the Connect component doesn't subscribe to store state changes
            shouldHandleStateChanges: Boolean(mapPropsToQueries) && Boolean(mapQueriesToProps),

            // passed through to selectorFactory
            initMapPropsToQueries: initMapPropsToQueries,
            initMapQueriesToProps: initMapQueriesToProps,
            initMapDispatchToProps: initMapDispatchToProps,
            initMergeProps: initMergeProps,
            pure: pure,
            areOwnPropsEqual: areOwnPropsEqual,
            areQueryPropsEqual: areQueryPropsEqual,
            areMergedPropsEqual: areMergedPropsEqual

        }, extraOptions));
    };
}

exports.default = createConnect();