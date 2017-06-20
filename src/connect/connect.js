import shallowEqual from '../utils/shallowEqual';
import connectAdvanced from './connectAdvanced';
import defaultMapDispatchToPropsFactories from './mapDispatchToProps';
import defaultMapPropsToQueriesFactories from './mapPropsToQueries';
import defaultMapQueriesToPropsFactories from './mapQueriesToProps';
import defaultMergePropsFactories from './mergeProps';
import defaultSelectorFactory from './selectorFactory';

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
    for (let i = factories.length - 1; i >= 0; i--) {
        const result = factories[i](arg);
        if (result) return result;
    }

    return (dispatch, options) => {
        throw new Error(`Invalid value of type ${typeof arg} for ${name} argument when connecting component ${options.wrappedComponentName}.`);
    }
}

function strictEqual(a, b) {
    return a === b;
}

// createConnect with default args builds the 'official' connect behavior. Calling it with
// different options opens up some testing and extensibility scenarios
export function createConnect({
    connectHOC = connectAdvanced,
    mapPropsToQueriesFactories = defaultMapPropsToQueriesFactories,
    mapQueriesToPropsFactories = defaultMapQueriesToPropsFactories,
    mapDispatchToPropsFactories = defaultMapDispatchToPropsFactories,
    mergePropsFactories = defaultMergePropsFactories,
    selectorFactory = defaultSelectorFactory
} = {}) {
    return function connect(
        mapPropsToQueries,
        mapQueriesToProps,
        mapDispatchToProps,
        mergeProps, {
            pure = true,
            areOwnPropsEqual = shallowEqual,
            areQueryPropsEqual = shallowEqual,
            areMergedPropsEqual = shallowEqual,
            ...extraOptions
        } = {}
    ) {
        const initMapPropsToQueries = match(mapPropsToQueries, mapPropsToQueriesFactories, 'mapPropsToQueries');
        const initMapQueriesToProps = match(mapQueriesToProps, mapQueriesToPropsFactories, 'mapQueriesToProps');
        const initMapDispatchToProps = match(mapDispatchToProps, mapDispatchToPropsFactories, 'mapDispatchToProps');
        const initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps');

        return connectHOC(selectorFactory, {
            // used in error messages
            methodName: 'connect',

            // used to compute Connect's displayName from the wrapped component's displayName.
            getDisplayName: name => `Connect(${name})`,

            // if mapStateToProps is falsy, the Connect component doesn't subscribe to store state changes
            shouldHandleStateChanges: Boolean(mapPropsToQueries) && Boolean(mapQueriesToProps),

            // passed through to selectorFactory
            initMapPropsToQueries,
            initMapQueriesToProps,
            initMapDispatchToProps,
            initMergeProps,
            pure,
            areOwnPropsEqual,
            areQueryPropsEqual,
            areMergedPropsEqual,

            // any extra options args can override defaults of connect or connectAdvanced
            ...extraOptions
        });
    }
}

export default createConnect();
