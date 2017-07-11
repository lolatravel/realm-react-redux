import { applyMiddleware } from 'redux';

describe('applyMiddleware', () => {
    const dispatch = jest.fn();
    const writer = jest.fn();
    const middlewareSetup = jest.fn();
    const middlewareRun = jest.fn();
    const realm = { realm: 'realm' };
    const action1 = { type: 'TEST1' };
    const action2 = { type: 'TEST2' };
    const asyncAction = (dispatch, realm) => {
        return new Promise((resolve, reject) => {
            dispatch(action1);
            resolve();
        });
    };
    const createRealmStore = () => {
        return {
            dispatch: (action) => writer(realm, action),
            getState: () => realm
        };
    };
    const middleware = ({dispatch, getState}) => {
        middlewareSetup({dispatch, getState});
        return next => action => {
            middlewareRun(action);
            return next(action);
        };
    };
    const thunk = ({dispatch, getState}) => {
        return next => action => {
            return typeof action === 'function' ?
                action(dispatch, getState) :
                next(action);
        };
    };

    beforeEach(() => {
        dispatch.mockReset();
        writer.mockReset();
        middlewareSetup.mockReset();
        middlewareRun.mockReset();
    });

    it('wraps dispatch method with middleware once', () => {
        const store = applyMiddleware(middleware)(createRealmStore)(writer);
        store.dispatch(action1);
        store.dispatch(action2);

        expect(middlewareSetup.mock.calls.length).toEqual(1);
        expect(middlewareSetup.mock.calls[0][0]).toHaveProperty('getState');
        expect(middlewareSetup.mock.calls[0][0]).toHaveProperty('dispatch');

        expect(writer.mock.calls[0][0]).toBe(realm);
        expect(writer.mock.calls[0][1]).toEqual(action1);
        expect(middlewareRun.mock.calls[0][0]).toEqual(action1);
        expect(writer.mock.calls[1][0]).toBe(realm);
        expect(writer.mock.calls[1][1]).toEqual(action2);
        expect(middlewareRun.mock.calls[1][0]).toEqual(action2);
    });

    it('passes recursive dispatches through the middleware chain', () => {
        const store = applyMiddleware(middleware, thunk)(createRealmStore)(writer);
        return store.dispatch(asyncAction).then(() => {
            expect(middlewareRun.mock.calls.length).toEqual(2);
        });
    });

    it('works with thunk middleware', () => {
        const store = applyMiddleware(thunk)(createRealmStore)(writer);
        return store.dispatch(asyncAction).then(() => {
            expect(writer.mock.calls.length).toEqual(1);
            expect(writer.mock.calls[0][0]).toEqual(realm);
            expect(writer.mock.calls[0][1]).toEqual(action1);
        });
    });
});
