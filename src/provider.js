import { Component, Children } from 'react';
import { storeShape, subscriptionShape } from './utils/PropTypes';
import PropTypes from 'prop-types';

let didWarnAboutReceivingStore = false;
function warnAboutReceivingStore() {
    if (didWarnAboutReceivingStore) {
        return;
    }
    didWarnAboutReceivingStore = true;

    console.warning('<RealmProvider> does not support changing `realmStore` on the fly. ');
}

export function createRealmProvider(storeKey = 'realmStore', subKey) {
    const subscriptionKey = subKey || `${storeKey}Subscription`;

    class Provider extends Component {
        getChildContext() {
            return { [storeKey]: this[storeKey], [subscriptionKey]: null };
        }

        constructor(props, context) {
            super(props, context);
            this[storeKey] = props[storeKey];
        }

        render() {
            return Children.only(this.props.children);
        }
    }

    Provider.propTypes = {
        realmStore: storeShape.isRequired,
        children: PropTypes.element.isRequired
    };

    Provider.childContextTypes = {
        [storeKey]: storeShape.isRequired,
        [subscriptionKey]: subscriptionShape
    };

    Provider.displayName = 'RealmProvider';

    if (process.env.NODE_ENV !== 'production') {
        Provider.prototype.componentWillReceiveProps = function (nextProps) {
            if (this[storeKey] !== nextProps[storeKey]) {
                warnAboutReceivingStore();
            }
        };
    }

    return Provider;
}

export default createRealmProvider();
