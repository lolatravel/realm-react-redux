import isPlainObject from 'lodash.isplainobject';
import Realm from 'realm';
import warning from './utils/warning';

export const ActionTypes = {
    INIT: '@@realm-react-redux/INIT',
    PROBE_UNKNOWN_ACTION: '@@realm-react-redux/PROBE_UNKNOWN_ACTION',
    UNSAFE_WRITE: '@@realm-react-redux/UNSAFE_WRITE'
};

export default function createRealmStore(writer, options, enhancer) {
    if (typeof options !== 'object') {
        throw new Error('Expected options to be an object');
    }

    let {
        realm,
        allowUnsafeWrites = false,
        watchUnsafeWrites = false,
        ...realmOptions
    } = options;
    allowUnsafeWrites = allowUnsafeWrites || watchUnsafeWrites;

    if (realm && (typeof realm.write !== 'function' || typeof realm.addListener !== 'function')) {
        throw new Error('Expected options.realm to be a Realm db or implement the same interface');
    }

    realm = realm || new Realm(realmOptions);

    if (typeof enhancer !== 'undefined') {
        if (typeof enhancer !== 'function') {
            throw new Error('Expected the enhancer to be a function.');
        }

        return enhancer(createRealmStore)(writer, realm);
    }

    if (typeof writer !== 'function') {
        throw new Error('Expected the writer to be a function.');
    }

    let isDispatching = false;
    let currentListeners = [];
    let nextListeners = currentListeners;

    const ensureCanMutateNextListeners = () => {
        if (nextListeners === currentListeners) {
            nextListeners = currentListeners.slice();
        }
    };

    const getState = () => realm;

    const subscribe = (listener) => {
        if (typeof listener !== 'function') {
            throw new Error('Expected listener to be a function.');
        }

        let isSubscribed = true;

        ensureCanMutateNextListeners();
        nextListeners.push(listener);

        return () => {
            if (!isSubscribed) {
                return;
            }

            isSubscribed = false;

            ensureCanMutateNextListeners();
            const index = nextListeners.indexOf(listener);
            nextListeners.splice(index, 1);
        };
    };

    const dispatch = (action) => {
        if (!isPlainObject(action)) {
            throw new Error(
                'Actions must be plain objects. ' +
                'Use custom middleware for async actions.'
            );
        }

        if (typeof action.type === 'undefined') {
            throw new Error(
                'Actions may not have an undefined "type" property. ' +
                'Have you misspelled a constant?'
            );
        }

        if (isDispatching) {
            if (action.type === ActionTypes.UNSAFE_WRITE) {
                return action;
            } else {
                throw new Error('writers may not dispatch actions.');
            }
        }

        if (action.type !== ActionTypes.UNSAFE_WRITE) {
            try {
                isDispatching = true;
                realm.write(() => {
                    writer(realm, action);
                });
                // TODO: Figure out if this is a bug in realm (testing with 0.15.1)
                // but change notifications aren't getting fired until the next write(),
                // even thought the object is already updated. This should be removed
                // once the problem is solved.
                realm.write(() => {});
            } finally {
                isDispatching = false;
            }
        }

        const listeners = currentListeners = nextListeners;
        listeners.forEach(listener => listener());

        return action;
    };

    realm.addListener('change', () => {
        if (!allowUnsafeWrites && !isDispatching) {
            warning('Realm updated outside of realmStore.dispatch()');
        }
        if (watchUnsafeWrites && !isDispatching) {
            // If watching for realm updates in general, dispatch
            // so that listeners get notified of the update
            dispatch({ type: ActionTypes.UNSAFE_WRITE });
        }
    });

    return {
        subscribe,
        getState,
        dispatch,
        options: {
            allowUnsafeWrites,
            watchUnsafeWrites
        }
    };
}
