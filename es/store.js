function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import isPlainObject from 'lodash.isplainobject';
import Realm from 'realm';
import warning from './utils/warning';

export var ActionTypes = {
    INIT: '@@realm-react-redux/INIT',
    PROBE_UNKNOWN_ACTION: '@@realm-react-redux/PROBE_UNKNOWN_ACTION',
    UNSAFE_WRITE: '@@realm-react-redux/UNSAFE_WRITE'
};

export default function createRealmStore(writer, options, enhancer) {
    if (typeof options !== 'object') {
        throw new Error('Expected options to be an object');
    }

    var realm = options.realm,
        _options$allowUnsafeW = options.allowUnsafeWrites,
        allowUnsafeWrites = _options$allowUnsafeW === undefined ? false : _options$allowUnsafeW,
        _options$watchUnsafeW = options.watchUnsafeWrites,
        watchUnsafeWrites = _options$watchUnsafeW === undefined ? false : _options$watchUnsafeW,
        realmOptions = _objectWithoutProperties(options, ['realm', 'allowUnsafeWrites', 'watchUnsafeWrites']);

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

    var isDispatching = false;
    var currentListeners = [];
    var nextListeners = currentListeners;

    var ensureCanMutateNextListeners = function ensureCanMutateNextListeners() {
        if (nextListeners === currentListeners) {
            nextListeners = currentListeners.slice();
        }
    };

    var getRealm = function getRealm() {
        return realm;
    };

    var subscribe = function subscribe(listener) {
        if (typeof listener !== 'function') {
            throw new Error('Expected listener to be a function.');
        }

        var isSubscribed = true;

        ensureCanMutateNextListeners();
        nextListeners.push(listener);

        return function () {
            if (!isSubscribed) {
                return;
            }

            isSubscribed = false;

            ensureCanMutateNextListeners();
            var index = nextListeners.indexOf(listener);
            nextListeners.splice(index, 1);
        };
    };

    var dispatch = function dispatch(action) {
        if (!isPlainObject(action)) {
            throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
        }

        if (typeof action.type === 'undefined') {
            throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
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
                realm.write(function () {
                    writer(realm, action);
                });
                // TODO: Figure out if this is a bug in realm (testing with 0.15.1)
                // but change notifications aren't getting fired until the next write(),
                // even thought the object is already updated. This should be removed
                // once the problem is solved.
                realm.write(function () {});
            } finally {
                isDispatching = false;
            }
        }

        var listeners = currentListeners = nextListeners;
        listeners.forEach(function (listener) {
            return listener();
        });

        return action;
    };

    realm.addListener('change', function () {
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
        subscribe: subscribe,
        getRealm: getRealm,
        dispatch: dispatch,
        options: {
            allowUnsafeWrites: allowUnsafeWrites,
            watchUnsafeWrites: watchUnsafeWrites
        }
    };
}