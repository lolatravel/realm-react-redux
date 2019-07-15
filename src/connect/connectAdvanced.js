import { connectAdvanced } from 'react-redux';

// connectAdvanced is almost usable as is, but there are 2 tweaks we need to make to have it
// work properly for the realm store. The first is we need to update teh default store key to
// match the store key we use in the provider. The second is that we need to cleanup
// the realm listeners when the connected component is unmounted. To do that we just extend
// the component returned from connectAdvanced to add the cleanup call to componentWillUnmount.
export default function(selectorFactory, { ...connectOptions }) {
    const connector = connectAdvanced(selectorFactory, { ...connectOptions });
    return function wrapWithConnect(ComponentToWrap) {
        const WrappedComponent = connector(ComponentToWrap);
        return class RealmConnectedComponent extends WrappedComponent {
            componentWillUnmount() {
                super.componentWillUnmount();
                this.selector.cleanup && this.selector.cleanup();
                this.selector.cleanup = null;
            }
        };
    };
}
