import { createProvider } from 'react-redux';

// We can use react-redux's Provider class, but we just need to switch
// the default key to `realmStore` so we don't collide with the redux
// store.
export function createRealmProvider(storeKey = 'realmStore', subKey) {
    return createProvider(storeKey, subKey);
}

export default createRealmProvider();
