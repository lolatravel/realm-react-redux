import { captureConsoleErrors } from './utils';
import { bindActionCreators } from '../src';

describe('bindActionCreators', () => {
    it('throws if passed null', () => {
        expect(() => bindActionCreators(null)).toThrow();
    });

    it('wraps each key of an object in the dispatch function', () => {
        const dispatch = jest.fn();
        const actions = {
            action1: () => { return {type: 'action1'}; },
            action2: () => { return {type: 'action2'}; }
        };
        const boundActions = bindActionCreators(actions, dispatch);
        expect(Object.keys(boundActions)).toEqual(Object.keys(actions));
        boundActions.action1();
        boundActions.action2();
        expect(dispatch.mock.calls.length).toEqual(2);
    });

    it('ignores actions that are not functions', () => {
        const dispatch = jest.fn();
        const actions = {
            action1: () => { return {type: 'action1'}; },
            object: {},
            string: 'string',
            number: 1,
            un: undefined,
            nul: null
        };
        captureConsoleErrors(() => {
            const boundActions = bindActionCreators(actions, dispatch);
            expect(boundActions.object).toBeUndefined();
            expect(boundActions.string).toBeUndefined();
            expect(boundActions.number).toBeUndefined();
            expect(boundActions.un).toBeUndefined();
            expect(boundActions.nul).toBeUndefined();
            expect(console.error.mock.calls.length).toBe(5);
            boundActions.action1();
            expect(dispatch.mock.calls.length).toEqual(1);
        });
    });
});
