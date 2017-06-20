import verifySubselectors from './verifySubselectors';

export function impureFinalPropsSelectorFactory(
    mapPropsToQueries,
    mapQueriesToProps,
    mapDispatchToProps,
    mergeProps,
    dispatch
) {
    return function impureFinalPropsSelector(realm, ownProps) {
        return mergeProps(
            mapQueriesToProps(mapPropsToQueries(realm, ownProps), ownProps),
            mapDispatchToProps(dispatch, ownProps),
            ownProps
        );
    }
}

export function pureFinalPropsSelectorFactory(
    mapPropsToQueries,
    mapQueriesToProps,
    mapDispatchToProps,
    mergeProps,
    dispatch,
    { areOwnPropsEqual, areQueryPropsEqual }
) {
    let hasRunAtLeastOnce = false;
    let realm;
    let queries;
    let ownProps;
    let queryProps;
    let dispatchProps;
    let mergedProps;
    let stateChanged = false;

    function onStateChanged(query, changes) {
        Object.keys(changes).forEach(type => {
            if (changes[type].length > 0) {
                stateChanged = true;
            }
        });
    }

    function forgetQueries(oldQueries) {
        oldQueries && oldQueries.forEach(q => q.removeListener(onStateChanged));
    }

    function setupQueries(newQueries) {
        newQueries && newQueries.forEach(q => q.addListener(onStateChanged));
        forgetQueries(queries);
        queries = newQueries;
        stateChanged = true;
    }

    function handleFirstCall(realm, firstOwnProps) {
        setupQueries(mapPropsToQueries(realm, firstOwnProps));
        ownProps = firstOwnProps;
        queryProps = mapQueriesToProps(queries, ownProps);
        dispatchProps = mapDispatchToProps(dispatch, ownProps);
        mergedProps = mergeProps(queryProps, dispatchProps, ownProps);
        hasRunAtLeastOnce = true;
        return mergedProps;
    }

    function handleNewPropsAndNewState() {
        queryProps = mapQueriesToProps(queries, ownProps);

        if (mapDispatchToProps.dependsOnOwnProps) {
            dispatchProps = mapDispatchToProps(dispatch, ownProps);
        }

        mergedProps = mergeProps(queryProps, dispatchProps, ownProps);
        stateChanged = false;
        return mergedProps;
    }

    function handleNewProps() {
        if (mapQueriesToProps.dependsOnOwnProps) {
            queryProps = mapQueriesToProps(queries, ownProps);
        }

        if (mapDispatchToProps.dependsOnOwnProps) {
            dispatchProps = mapDispatchToProps(dispatch, ownProps);
        }

        mergedProps = mergeProps(queryProps, dispatchProps, ownProps);
        return mergedProps;
    }

    function handleNewState() {
        const nextQueryProps = mapQueriesToProps(queries, ownProps);
        const queryPropsChanged = !areQueryPropsEqual(nextQueryProps, queryProps);
        queryProps = nextQueryProps;

        if (queryPropsChanged) {
            mergedProps = mergeProps(queryProps, dispatchProps, ownProps);
        }

        stateChanged = false;
        return mergedProps;
    }

    function handleSubsequentCalls(realm, nextOwnProps) {
        const propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps);
        if (propsChanged && mapPropsToQueries.dependsOnOwnProps) {
            setupQueries(mapPropsToQueries(realm, ownProps));
        }
        ownProps = nextOwnProps;

        if (propsChanged && stateChanged) return handleNewPropsAndNewState();
        if (propsChanged) return handleNewProps();
        if (stateChanged) return handleNewState();
        return mergedProps;
    }

    function pureFinalPropsSelector(realm, nextOwnProps) {
        return hasRunAtLeastOnce
            ? handleSubsequentCalls(realm, nextOwnProps)
            : handleFirstCall(realm, nextOwnProps);
    }

    pureFinalPropsSelector.cleanup = function cleanup() {
        // Remove any listeners
        setupQueries(null);
    }
    return pureFinalPropsSelector;
}

// TODO: Add more comments

// If pure is true, the selector returned by selectorFactory will memoize its results,
// allowing connectAdvanced's shouldComponentUpdate to return false if final
// props have not changed. If false, the selector will always return a new
// object and shouldComponentUpdate will always return true.

export default function finalPropsSelectorFactory(dispatch, {
    initMapPropsToQueries,
    initMapQueriesToProps,
    initMapDispatchToProps,
    initMergeProps,
    ...options
}) {
    const mapPropsToQueries = initMapPropsToQueries(dispatch, options);
    const mapQueriesToProps = initMapQueriesToProps(dispatch, options);
    const mapDispatchToProps = initMapDispatchToProps(dispatch, options);
    const mergeProps = initMergeProps(dispatch, options);

    if (process.env.NODE_ENV !== 'production') {
        verifySubselectors(mapPropsToQueries, mapQueriesToProps, mapDispatchToProps, mergeProps, options.displayName);
    }

    const selectorFactory = options.pure
        ? pureFinalPropsSelectorFactory
        : impureFinalPropsSelectorFactory;

    return selectorFactory(
        mapPropsToQueries,
        mapQueriesToProps,
        mapDispatchToProps,
        mergeProps,
        dispatch,
        options
    );
}
