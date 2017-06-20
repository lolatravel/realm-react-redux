
const Realm = jest.genMockFromModule('realm');

class MockRealm extends Realm {

    addListener(event, fn) {
        this.listeners = this.listeners || [];
        this.listeners.push(fn);
    }

    removeListener(event, fn) {
        this.listeners = this.listeners || [];
        const index = this.listeners.indexOf(fn);
        this.listeners.splice(index, 1);
    }

    write(fn) {
        super.write(fn);
        fn();
        if (this.listeners) this.listeners.forEach(listener => listener());
    }

    reset() {
        this.listeners = null;
    }
}

export default MockRealm;
