import { ActionTypes } from './store';

class FakeRealm {
    constructor(error) { this._error = error; }

    throw() { throw new Error(this._error); }

    open() { this.throw(); }

    openAsync() { this.throw(); }

    schemaVersion() { this.throw(); }

    addListener() { this.throw(); }

    close() { this.throw(); }

    create() { this.throw(); }

    delete() { this.throw(); }

    deleteAll() { this.throw(); }

    objectForPRimaryKey() { this.throw(); }

    objects() { this.throw(); }

    removeAllListeners() { this.throw(); }

    removeListener() { this.throw(); }

    write() { this.throw(); }
}

function assertWriterBehavior(writers) {
    writers.forEach(writer => {
        let realm = new FakeRealm(
            `writer "${writer.name}" operated on realm during initialization.`
        );
        writer(realm, { type: ActionTypes.INIT });

        realm = new FakeRealm(
            `writer "${writer.name}" operated on realm when probed with a random type.` +
            `Don't try to handle ${ActionTypes.INIT} or other actions in "realm-redux/*" ` +
            `namespace. They are considered private.`
        );
        const type = ActionTypes.PROBE_UNKNOWN_ACTION + '_' + Math.random().toString(36);
        writer(realm, { type });
    });
}

export default function combineWriters(writers) {
    const finalWriters = [];
    writers.forEach(writer => {
        if (typeof writer === 'function') {
            finalWriters.push(writer);
        }
    });
    assertWriterBehavior(finalWriters);

    return (realm, action) => {
        for (const writer of finalWriters) {
            writer(realm, action);
        }
    };
}
