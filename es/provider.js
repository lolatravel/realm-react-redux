function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { Component, Children } from 'react';
import { storeShape, subscriptionShape } from './utils/PropTypes';
import PropTypes from 'prop-types';

var didWarnAboutReceivingStore = false;
function warnAboutReceivingStore() {
    if (didWarnAboutReceivingStore) {
        return;
    }
    didWarnAboutReceivingStore = true;

    console.warning('<RealmProvider> does not support changing `realmStore` on the fly. ');
}

export function createRealmProvider() {
    var _Provider$childContex;

    var storeKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'realmStore';
    var subKey = arguments[1];

    var subscriptionKey = subKey || storeKey + 'Subscription';

    var Provider = function (_Component) {
        _inherits(Provider, _Component);

        Provider.prototype.getChildContext = function getChildContext() {
            var _ref;

            return _ref = {}, _ref[storeKey] = this[storeKey], _ref[subscriptionKey] = null, _ref;
        };

        function Provider(props, context) {
            _classCallCheck(this, Provider);

            var _this = _possibleConstructorReturn(this, _Component.call(this, props, context));

            _this[storeKey] = props[storeKey];
            return _this;
        }

        Provider.prototype.render = function render() {
            return Children.only(this.props.children);
        };

        return Provider;
    }(Component);

    Provider.propTypes = {
        realmStore: storeShape.isRequired,
        children: PropTypes.element.isRequired
    };

    Provider.childContextTypes = (_Provider$childContex = {}, _Provider$childContex[storeKey] = storeShape.isRequired, _Provider$childContex[subscriptionKey] = subscriptionShape, _Provider$childContex);

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