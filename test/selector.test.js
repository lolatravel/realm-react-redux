import MockRealm, { MockQuery } from 'realm';
import { pureFinalPropsSelectorFactory } from '../src/connect/selectorFactory';

describe('selectorFactory', () => {
    const realm = new MockRealm();
    const Query = jest.fn(() => new MockQuery());
    const query1 = new Query();
    const query2 = new Query();

    const queries = [query1, query2];
    const queryProps = { queryProps: true };
    const dispatchProps = { dispatchProps: true };
    const finalProps = {
        ...queryProps,
        ...dispatchProps
    };

    const mapPropsToQueries = jest.fn();
    const mapQueriesToProps = jest.fn();
    const mapDispatchToProps = jest.fn();
    const mergeProps = jest.fn();
    const dispatch = jest.fn();

    const areOwnPropsEqual = jest.fn();
    const areQueryPropsEqual = jest.fn();

    beforeEach(() => {
        mapPropsToQueries.mockClear();
        mapPropsToQueries.mockImplementation(() => queries);
        mapPropsToQueries.dependsOnOwnProps = true;
        mapQueriesToProps.mockClear();
        mapQueriesToProps.mockImplementation(() => queryProps);
        mapQueriesToProps.dependsOnOwnProps = true;
        mapDispatchToProps.mockClear();
        mapDispatchToProps.mockImplementation(() => dispatchProps);
        mapDispatchToProps.dependsOnOwnProps = true;
        mergeProps.mockClear();
        mergeProps.mockImplementation(() => finalProps);
        dispatch.mockClear();
        query1.mockClear();
        query2.mockClear();
        realm.mockClear();
        areOwnPropsEqual.mockClear();
        areOwnPropsEqual.mockImplementation(() => false);
        areQueryPropsEqual.mockClear();
        areQueryPropsEqual.mockImplementation(() => false);
    });

    it('returns a function', () => {
        expect(typeof pureFinalPropsSelectorFactory(
            mapPropsToQueries,
            mapQueriesToProps,
            mapDispatchToProps,
            mergeProps,
            dispatch,
            {}
        )).toEqual('function');
        mergeProps.hello = true;
    });

    it('calls all the mapping functions to generate first props', () => {
        const firstProps = { customProp: 'test' };

        const selector = pureFinalPropsSelectorFactory(
            mapPropsToQueries,
            mapQueriesToProps,
            mapDispatchToProps,
            mergeProps.mockImplementation(() => { return { ...finalProps, ...firstProps }; }),
            dispatch,
            { areOwnPropsEqual, areQueryPropsEqual }
        );

        const nextProps = selector(realm, firstProps);
        expect(areQueryPropsEqual.mock.calls.length).toBe(0);
        expect(areOwnPropsEqual.mock.calls.length).toBe(0);

        expect(mapPropsToQueries.mock.calls.length).toBe(1);
        expect(mapPropsToQueries.mock.calls[0][0]).toBe(realm);
        expect(mapPropsToQueries.mock.calls[0][1]).toBe(firstProps);

        expect(mapQueriesToProps.mock.calls.length).toBe(1);
        expect(mapQueriesToProps.mock.calls[0][0]).toEqual(queries);
        expect(mapQueriesToProps.mock.calls[0][1]).toBe(firstProps);

        expect(mapDispatchToProps.mock.calls.length).toBe(1);
        expect(mapDispatchToProps.mock.calls[0][0]).toEqual(dispatch);
        expect(mapDispatchToProps.mock.calls[0][1]).toBe(firstProps);

        expect(mergeProps.mock.calls.length).toBe(1);
        expect(mergeProps.mock.calls[0][0]).toEqual(queryProps);
        expect(mergeProps.mock.calls[0][1]).toBe(dispatchProps);
        expect(mergeProps.mock.calls[0][2]).toBe(firstProps);
        expect(nextProps).toEqual({...finalProps, ...firstProps});
    });

    it('skips unnecessary mapPropsToQueries call when not dependent on ownProps', () => {
        const firstProps = { customProp: 'test' };
        const secondProps = { customProp: 'test2' };
        mapPropsToQueries.dependsOnOwnProps = false;

        const selector = pureFinalPropsSelectorFactory(
            mapPropsToQueries,
            mapQueriesToProps,
            mapDispatchToProps,
            mergeProps.mockImplementation(() => { return { ...finalProps, ...secondProps }; }),
            dispatch,
            { areOwnPropsEqual, areQueryPropsEqual }
        );

        selector(realm, firstProps);
        const nextProps = selector(realm, secondProps);
        expect(areOwnPropsEqual.mock.calls.length).toBe(1);
        expect(mapPropsToQueries.mock.calls.length).toBe(1);
    });

    it('skips unnecessary mapPropsToQueries call when ownProps didn\'t change', () => {
        const firstProps = { customProp: 'test' };
        const secondProps = { customProp: 'test2' };
        areOwnPropsEqual.mockImplementation(() => true);

        const selector = pureFinalPropsSelectorFactory(
            mapPropsToQueries,
            mapQueriesToProps,
            mapDispatchToProps,
            mergeProps.mockImplementation(() => { return { ...finalProps, ...secondProps }; }),
            dispatch,
            { areOwnPropsEqual, areQueryPropsEqual }
        );

        selector(realm, firstProps);
        selector(realm, secondProps);
        expect(areOwnPropsEqual.mock.calls.length).toBe(1);
        expect(mapPropsToQueries.mock.calls.length).toBe(1);
    });

    it('handles props changed and state changed when everything actually changed', () => {
        const firstProps = { customProp: 'test' };
        const secondProps = { customProp: 'test2' };

        const selector = pureFinalPropsSelectorFactory(
            mapPropsToQueries,
            mapQueriesToProps,
            mapDispatchToProps,
            mergeProps.mockImplementation(() => { return { ...finalProps, ...secondProps }; }),
            dispatch,
            { areOwnPropsEqual, areQueryPropsEqual }
        );

        selector(realm, firstProps);
        query1.triggerListeners({insertions: [null]});
        const nextProps = selector(realm, secondProps);
        expect(areQueryPropsEqual.mock.calls.length).toBe(0);
        expect(areOwnPropsEqual.mock.calls.length).toBe(1);

        expect(mapPropsToQueries.mock.calls.length).toBe(2);
        expect(mapPropsToQueries.mock.calls[1][0]).toBe(realm);
        expect(mapPropsToQueries.mock.calls[1][1]).toBe(secondProps);

        expect(mapQueriesToProps.mock.calls.length).toBe(2);
        expect(mapQueriesToProps.mock.calls[1][0]).toEqual(queries);
        expect(mapQueriesToProps.mock.calls[1][1]).toBe(secondProps);

        expect(mapDispatchToProps.mock.calls.length).toBe(2);
        expect(mapDispatchToProps.mock.calls[1][0]).toEqual(dispatch);
        expect(mapDispatchToProps.mock.calls[1][1]).toBe(secondProps);

        expect(mergeProps.mock.calls.length).toBe(2);
        expect(mergeProps.mock.calls[1][0]).toEqual(queryProps);
        expect(mergeProps.mock.calls[1][1]).toBe(dispatchProps);
        expect(mergeProps.mock.calls[1][2]).toBe(secondProps);
        expect(nextProps).toEqual({...finalProps, ...secondProps});
    });

    it('handles props changed and state change and skips unnecessary mapDispatchToProps call', () => {
        const firstProps = { customProp: 'test' };
        const secondProps = { customProp: 'test2' };
        mapDispatchToProps.dependsOnOwnProps = false;

        const selector = pureFinalPropsSelectorFactory(
            mapPropsToQueries,
            mapQueriesToProps,
            mapDispatchToProps,
            mergeProps.mockImplementation(() => { return { ...finalProps, ...secondProps }; }),
            dispatch,
            { areOwnPropsEqual, areQueryPropsEqual }
        );

        selector(realm, firstProps);
        query1.triggerListeners({insertions: [null]});
        const nextProps = selector(realm, secondProps);
        expect(areQueryPropsEqual.mock.calls.length).toBe(0);
        expect(areOwnPropsEqual.mock.calls.length).toBe(1);

        expect(mapPropsToQueries.mock.calls.length).toBe(2);
        expect(mapQueriesToProps.mock.calls.length).toBe(2);
        expect(mapDispatchToProps.mock.calls.length).toBe(1);
        expect(mergeProps.mock.calls.length).toBe(2);

        expect(nextProps).toEqual({...finalProps, ...secondProps});
    });

    it('handles props changed', () => {
        const firstProps = { customProp: 'test' };
        const secondProps = { customProp: 'test2' };
        mapPropsToQueries.dependsOnOwnProps = false;

        const selector = pureFinalPropsSelectorFactory(
            mapPropsToQueries,
            mapQueriesToProps,
            mapDispatchToProps,
            mergeProps.mockImplementation(() => { return { ...finalProps, ...secondProps }; }),
            dispatch,
            { areOwnPropsEqual, areQueryPropsEqual }
        );

        selector(realm, firstProps);
        const nextProps = selector(realm, secondProps);
        expect(areQueryPropsEqual.mock.calls.length).toBe(0);
        expect(areOwnPropsEqual.mock.calls.length).toBe(1);

        expect(mapPropsToQueries.mock.calls.length).toBe(1);
        expect(mapQueriesToProps.mock.calls.length).toBe(2);
        expect(mapDispatchToProps.mock.calls.length).toBe(2);
        expect(mergeProps.mock.calls.length).toBe(2);

        expect(nextProps).toEqual({...finalProps, ...secondProps});
    });

    it('handles props changed but skips unnecessary mapQueriestoProps and mapDispatchToProps', () => {
        const firstProps = { customProp: 'test' };
        const secondProps = { customProp: 'test2' };
        mapQueriesToProps.dependsOnOwnProps = false;
        mapDispatchToProps.dependsOnOwnProps = false;

        const selector = pureFinalPropsSelectorFactory(
            mapPropsToQueries,
            mapQueriesToProps,
            mapDispatchToProps,
            mergeProps.mockImplementation(() => { return { ...finalProps, ...secondProps }; }),
            dispatch,
            { areOwnPropsEqual, areQueryPropsEqual }
        );

        selector(realm, firstProps);
        const nextProps = selector(realm, secondProps);
        expect(areQueryPropsEqual.mock.calls.length).toBe(0);
        expect(areOwnPropsEqual.mock.calls.length).toBe(1);

        expect(mapPropsToQueries.mock.calls.length).toBe(2);
        expect(mapQueriesToProps.mock.calls.length).toBe(1);
        expect(mapDispatchToProps.mock.calls.length).toBe(1);
        expect(mergeProps.mock.calls.length).toBe(2);

        expect(nextProps).toEqual({...finalProps, ...secondProps});
    });

    it('triggers state change if queries changed', () => {
        const firstProps = { customProp: 'test' };
        const secondProps = { customProp: 'test2' };
        mapQueriesToProps.dependsOnOwnProps = false;
        mapDispatchToProps.dependsOnOwnProps = false;

        const selector = pureFinalPropsSelectorFactory(
            mapPropsToQueries,
            mapQueriesToProps,
            mapDispatchToProps,
            mergeProps.mockImplementation(() => { return { ...finalProps, ...secondProps }; }),
            dispatch,
            { areOwnPropsEqual, areQueryPropsEqual }
        );

        selector(realm, firstProps);
        mapPropsToQueries.mockImplementation(() => [query2, query1]);
        const nextProps = selector(realm, secondProps);
        expect(areQueryPropsEqual.mock.calls.length).toBe(0);
        expect(areOwnPropsEqual.mock.calls.length).toBe(1);

        expect(mapPropsToQueries.mock.calls.length).toBe(2);
        expect(mapQueriesToProps.mock.calls.length).toBe(2);
        expect(mapDispatchToProps.mock.calls.length).toBe(1);

        expect(mergeProps.mock.calls.length).toBe(2);
        expect(mergeProps.mock.calls[1][0]).toEqual(queryProps);
        expect(mergeProps.mock.calls[1][1]).toBe(dispatchProps);
        expect(mergeProps.mock.calls[1][2]).toBe(secondProps);
        expect(nextProps).toEqual({...finalProps, ...secondProps});
    });

    it('handles state changes', () => {
        const firstProps = { customProp: 'test' };
        areOwnPropsEqual.mockImplementation(() => true);

        const selector = pureFinalPropsSelectorFactory(
            mapPropsToQueries,
            mapQueriesToProps,
            mapDispatchToProps,
            mergeProps.mockImplementation(() => { return { ...finalProps, ...firstProps }; }),
            dispatch,
            { areOwnPropsEqual, areQueryPropsEqual }
        );

        selector(realm, firstProps);
        query1.triggerListeners({insertions: [null]});
        const nextProps = selector(realm, firstProps);
        expect(areQueryPropsEqual.mock.calls.length).toBe(1);
        expect(areOwnPropsEqual.mock.calls.length).toBe(1);

        expect(mapPropsToQueries.mock.calls.length).toBe(1);
        expect(mapQueriesToProps.mock.calls.length).toBe(2);
        expect(mapDispatchToProps.mock.calls.length).toBe(1);
        expect(mergeProps.mock.calls.length).toBe(2);
        expect(nextProps).toEqual({...finalProps, ...firstProps});
    });

    it('handles state changes but skips unnecessary mergeProps calls', () => {
        const firstProps = { customProp: 'test' };
        areOwnPropsEqual.mockImplementation(() => true);
        areQueryPropsEqual.mockImplementation(() => true);

        const selector = pureFinalPropsSelectorFactory(
            mapPropsToQueries,
            mapQueriesToProps,
            mapDispatchToProps,
            mergeProps.mockImplementation(() => { return { ...finalProps, ...firstProps }; }),
            dispatch,
            { areOwnPropsEqual, areQueryPropsEqual }
        );

        selector(realm, firstProps);
        query1.triggerListeners({insertions: [null]});
        const nextProps = selector(realm, firstProps);
        expect(areQueryPropsEqual.mock.calls.length).toBe(1);
        expect(areOwnPropsEqual.mock.calls.length).toBe(1);

        expect(mapPropsToQueries.mock.calls.length).toBe(1);
        expect(mapQueriesToProps.mock.calls.length).toBe(2);
        expect(mapDispatchToProps.mock.calls.length).toBe(1);
        expect(mergeProps.mock.calls.length).toBe(1);
        expect(nextProps).toEqual({...finalProps, ...firstProps});
    });
});
