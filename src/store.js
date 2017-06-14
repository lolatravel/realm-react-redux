import isPlainObject from 'lodash.isplainobject';
import Realm from 'realm';

export const ActionTypes = {
    INIT: '@@realm-redux/INIT',
    PROBE_UNKNOWN_ACTION: '@@realm-redux/PROBE_UNKNOWN_ACTION'
}

export default function createRealmStore(writer, realmOptions, enhancer) {
    if (typeof realmOptions !== 'object') {
        throw new Error('Expected realmOptions to be an object');
    }

    let realm = realmOptions.realm;
    if (realm && !(realm instanceof Realm)) {
        throw new Error('Expected realmOptions.realm to be a Realm db');
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
            nextListeners = currentListeners.slice()
        }
    }

    realm.addListener(() => {
        if (!isDispatching) {
            throw new Error('Realm updated outside of realmStore.dispatch()');
        }
    });

    const getRealm = () => realm;

    const subscribe = (listener) => {
        if (typeof listener !== 'function') {
            throw new Error('Expected listener to be a function.')
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
        }
    }

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
            throw new Error('writers may not dispatch actions.');
        }

        try {
            isDispatching = true;
            realm.write(() => {
                writer(action);
            });
        } finally {
            isDispatching = false;
        }

        const listeners = currentListeners = nextListeners;
        listeners.forEach(listener => listener());

        return action;
    };

    return {
        subscribe,
        getRealm,
        dispatch
    };
};
