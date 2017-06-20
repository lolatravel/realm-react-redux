import Realm from 'realm';
import { captureConsoleErrors } from './utils';
import { createRealmStore } from '../src';

describe('Realm Store', () => {
    const writer = jest.fn();
    const realm = new Realm();

    beforeEach(()=> {
        Realm.mockReset();
        writer.mockReset();
        realm.reset();
    });

    describe('createRealmStore', () => {
        it('uses the passed-in realm', () => {
            const store = createRealmStore(writer, { realm });
            expect(store.getRealm()).toBe(realm);
        });

        it('creates a realm instance if one is not passed in', () => {
            const options = { readOnly: true };
            const store = createRealmStore(writer, options);
            expect(Realm.mock.calls[0][0]).toEqual(options);
            expect(store.getRealm()).toEqual(Realm.mock.instances[0]);
        });

        it('it calls the enhancer if one is passed', () => {
            const enhancer = jest.fn();
            const middleware = jest.fn();
            enhancer.mockReturnValue(middleware);
            const store = createRealmStore(writer, { realm }, enhancer);
            expect(enhancer.mock.calls[0][0]).toBe(createRealmStore);
            expect(middleware.mock.calls[0][0]).toBe(writer);
            expect(middleware.mock.calls[0][1]).toBe(realm);
        });

        it('throws if the writer is not a function', () => {
            expect(() => createRealmStore({}, { realm })).toThrow();
        });

        it('throws if realm is updated outside of store.dispatch', () => {
            const store = createRealmStore(writer, { realm });
            captureConsoleErrors(() => {
                realm.write(() => {})
                expect(console.error.mock.calls.length).toEqual(1);
                expect(console.error.mock.calls[0][0]).toEqual(
                    expect.stringContaining('Realm updated outside'));
            });
        });
    });

    describe('dispatch', () => {
        it('throws if that action is not a plain object', () => {
            const store = createRealmStore(writer, { realm });
            class Test {};
            expect(() => store.dispatch(new Test())).toThrow('Actions must be plain objects.');
        });

        it('throws if action.type is undefined', () => {
            const store = createRealmStore(writer, { realm });
            expect(() => store.dispatch({})).toThrow('Actions may not have an undefined "type"');
        });

        it('throws if trying to dispatch an action while already dispatching', () => {
            const store = createRealmStore(() => {
                store.dispatch({type: 'second'});
            }, { realm });
            expect(() => store.dispatch({type: 'first'})).toThrow('writers may not dispatch actions');
        });

        it('calls the writer from a realm.write transaction', () => {
            const oldWrite = realm.write;
            const testAction = {type: 'test'};
            let state = 'init';
            realm.write = (fn) => {
                state = 'writing';
                oldWrite.call(realm, fn);
                state = 'done';
            };
            try {
                const writer = (realm, action) => {
                    expect(state).toEqual('writing');
                    expect(action).toEqual(testAction);
                };
                const store = createRealmStore(writer, { realm });
                store.dispatch(testAction);
                expect(state).toEqual('done');
            } finally {
                realm.write = oldWrite;
            }
        });
    });

    describe('subscribe', () => {
        it('calls subscribed listeners', () => {
            const store = createRealmStore(writer, { realm });
            const listener = jest.fn();
            store.subscribe(listener);
            store.dispatch({type: 'test'});
            expect(listener.mock.calls.length).toEqual(1);
        });

        it('doesn\'t call unsubscribed listeners', () => {
            const store = createRealmStore(writer, { realm });
            const listener = jest.fn();
            const unsubscribe = store.subscribe(listener);
            unsubscribe();
            store.dispatch({type: 'test'});
            expect(listener.mock.calls.length).toEqual(0);
        });
    });
});
