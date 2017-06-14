import { combineWriters } from '../src';
import { ActionTypes } from '../src/store';

describe('combineWriters', () => {
    it('ignores all writers which are not a function', () => {
        const mw = jest.fn();
        const writer = combineWriters([
            true,
            'string',
            { nested: 'object' },
            (realm, action) => mw(realm, action)
        ]);
        expect(mw.mock.calls.length).toEqual(2);
        writer();
        expect(mw.mock.calls.length).toEqual(3);
    });

    it('warns if a writer tries to handle initialization or unknown actions', () => {
        const writer1 = (realm, action) => {
            action.type === ActionTypes.INIT && realm.create();
        };
        const writer2 = (realm, action) => {
            action.type.startsWith(ActionTypes.PROBE_UNKNOWN_ACTION) && realm.create();
        };
        expect(() => combineWriters([writer1])).toThrow();
        expect(() => combineWriters([writer2])).toThrow();
    });
});
