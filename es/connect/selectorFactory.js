function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import verifySubselectors from './verifySubselectors';
import { ActionTypes } from '../store';

export function impureFinalPropsSelectorFactory(mapPropsToQueries, mapQueriesToProps, mapDispatchToProps, mergeProps, dispatch) {
    return function impureFinalPropsSelector(realm, ownProps) {
        return mergeProps(mapQueriesToProps(mapPropsToQueries(realm, ownProps).map(function (q) {
            return q.snapshot();
        }), ownProps), mapDispatchToProps(dispatch, ownProps), ownProps);
    };
}

export function pureFinalPropsSelectorFactory(mapPropsToQueries, mapQueriesToProps, mapDispatchToProps, mergeProps, dispatch, _ref) {
    var areOwnPropsEqual = _ref.areOwnPropsEqual,
        areQueryPropsEqual = _ref.areQueryPropsEqual,
        watchUnsafeWrites = _ref.watchUnsafeWrites;

    var hasRunAtLeastOnce = false;
    var queries = void 0;
    var ownProps = void 0;
    var queryProps = void 0;
    var dispatchProps = void 0;
    var mergedProps = void 0;
    var stateChanged = false;

    function onStateChanged(query, changes) {
        for (var _iterator = Object.keys(changes), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
            var _ref2;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref2 = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref2 = _i.value;
            }

            var type = _ref2;

            if (changes[type].length > 0) {
                stateChanged = true;
                // If we are watching unsafe writes for this connected component
                // then we must dispatch so that the component will rerun the
                // selector. The store will ignore this if we are currently
                // in the middle of dispatching, so this should only affect
                // changes made outside of the store.
                if (watchUnsafeWrites) {
                    dispatch({ type: ActionTypes.UNSAFE_WRITE });
                }
                return;
            }
        }
    }

    function forgetQueries(oldQueries) {
        oldQueries && oldQueries.forEach(function (q) {
            return q.removeListener(onStateChanged);
        });
    }

    function setupQueries(newQueries) {
        newQueries && newQueries.forEach(function (q) {
            return q.addListener(onStateChanged);
        });
        forgetQueries(queries);
        queries = newQueries;
        stateChanged = true;
    }

    function handleFirstCall(realm, firstOwnProps) {
        setupQueries(mapPropsToQueries(realm, firstOwnProps));
        ownProps = firstOwnProps;
        queryProps = mapQueriesToProps(queries.map(function (q) {
            return q.snapshot();
        }), ownProps);
        dispatchProps = mapDispatchToProps(dispatch, ownProps);
        mergedProps = mergeProps(queryProps, dispatchProps, ownProps);
        hasRunAtLeastOnce = true;
        return mergedProps;
    }

    function handleNewPropsAndNewState() {
        queryProps = mapQueriesToProps(queries.map(function (q) {
            return q.snapshot();
        }), ownProps);

        if (mapDispatchToProps.dependsOnOwnProps) {
            dispatchProps = mapDispatchToProps(dispatch, ownProps);
        }

        mergedProps = mergeProps(queryProps, dispatchProps, ownProps);
        stateChanged = false;
        return mergedProps;
    }

    function handleNewProps() {
        if (mapQueriesToProps.dependsOnOwnProps) {
            queryProps = mapQueriesToProps(queries.map(function (q) {
                return q.snapshot();
            }), ownProps);
        }

        if (mapDispatchToProps.dependsOnOwnProps) {
            dispatchProps = mapDispatchToProps(dispatch, ownProps);
        }

        mergedProps = mergeProps(queryProps, dispatchProps, ownProps);
        return mergedProps;
    }

    function handleNewState() {
        var nextQueryProps = mapQueriesToProps(queries.map(function (q) {
            return q.snapshot();
        }), ownProps);
        var queryPropsChanged = !areQueryPropsEqual(nextQueryProps, queryProps);
        queryProps = nextQueryProps;

        if (queryPropsChanged) {
            mergedProps = mergeProps(queryProps, dispatchProps, ownProps);
        }

        stateChanged = false;
        return mergedProps;
    }

    function handleSubsequentCalls(realm, nextOwnProps) {
        var propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps);
        if (propsChanged && mapPropsToQueries.dependsOnOwnProps) {
            var newQueries = mapPropsToQueries(realm, nextOwnProps);
            if (newQueries !== queries) setupQueries(newQueries);
        }
        ownProps = nextOwnProps;

        if (propsChanged && stateChanged) return handleNewPropsAndNewState();
        if (propsChanged) return handleNewProps();
        if (stateChanged) return handleNewState();
        return mergedProps;
    }

    function pureFinalPropsSelector(realm, nextOwnProps) {
        return hasRunAtLeastOnce ? handleSubsequentCalls(realm, nextOwnProps) : handleFirstCall(realm, nextOwnProps);
    }

    pureFinalPropsSelector.cleanup = function cleanup() {
        // Remove any listeners
        setupQueries(null);
    };
    return pureFinalPropsSelector;
}

// TODO: Add more comments

// If pure is true, the selector returned by selectorFactory will memoize its results,
// allowing connectAdvanced's shouldComponentUpdate to return false if final
// props have not changed. If false, the selector will always return a new
// object and shouldComponentUpdate will always return true.

export default function finalPropsSelectorFactory(dispatch, _ref3) {
    var initMapPropsToQueries = _ref3.initMapPropsToQueries,
        initMapQueriesToProps = _ref3.initMapQueriesToProps,
        initMapDispatchToProps = _ref3.initMapDispatchToProps,
        initMergeProps = _ref3.initMergeProps,
        options = _objectWithoutProperties(_ref3, ['initMapPropsToQueries', 'initMapQueriesToProps', 'initMapDispatchToProps', 'initMergeProps']);

    var mapPropsToQueries = initMapPropsToQueries(dispatch, options);
    var mapQueriesToProps = initMapQueriesToProps(dispatch, options);
    var mapDispatchToProps = initMapDispatchToProps(dispatch, options);
    var mergeProps = initMergeProps(dispatch, options);

    if (process.env.NODE_ENV !== 'production') {
        verifySubselectors(mapPropsToQueries, mapQueriesToProps, mapDispatchToProps, mergeProps, options.displayName);
    }

    var selectorFactory = options.pure ? pureFinalPropsSelectorFactory : impureFinalPropsSelectorFactory;

    return selectorFactory(mapPropsToQueries, mapQueriesToProps, mapDispatchToProps, mergeProps, dispatch, options);
}