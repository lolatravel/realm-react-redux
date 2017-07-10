
const Realm = jest.genMockFromModule('realm');

export class MockRealm extends Realm {
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

    mockReset() {
        delete this.listeners;
    }

    mockClear() {
        this.mockReset();
    }
}

export class MockQuery {
    addListener(fn) {
        this.listeners = this.listeners || [];
        this.listeners.push(fn);
    }

    removeListener(fn) {
        this.listeners = this.listeners || [];
        const index = this.listeners.indexOf(fn);
        this.listeners.splice(index, 1);
    }

    triggerListeners(changes) {
        if (this.listeners) this.listeners.forEach(listener => listener(this, changes));
    }

    snapshot() {
        return this;
    }

    mockReset() {
        delete this.listeners;
    }

    mockClear() {
        this.mockReset();
    }
}
export default MockRealm;
