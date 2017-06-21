function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { ActionTypes } from './store';

var FakeRealm = function () {
    function FakeRealm(error) {
        _classCallCheck(this, FakeRealm);

        this._error = error;
    }

    FakeRealm.prototype.throw = function _throw() {
        throw new Error(this._error);
    };

    FakeRealm.prototype.open = function open() {
        this.throw();
    };

    FakeRealm.prototype.openAsync = function openAsync() {
        this.throw();
    };

    FakeRealm.prototype.schemaVersion = function schemaVersion() {
        this.throw();
    };

    FakeRealm.prototype.addListener = function addListener() {
        this.throw();
    };

    FakeRealm.prototype.close = function close() {
        this.throw();
    };

    FakeRealm.prototype.create = function create() {
        this.throw();
    };

    FakeRealm.prototype.delete = function _delete() {
        this.throw();
    };

    FakeRealm.prototype.deleteAll = function deleteAll() {
        this.throw();
    };

    FakeRealm.prototype.objectForPRimaryKey = function objectForPRimaryKey() {
        this.throw();
    };

    FakeRealm.prototype.objects = function objects() {
        this.throw();
    };

    FakeRealm.prototype.removeAllListeners = function removeAllListeners() {
        this.throw();
    };

    FakeRealm.prototype.removeListener = function removeListener() {
        this.throw();
    };

    FakeRealm.prototype.write = function write() {
        this.throw();
    };

    return FakeRealm;
}();

function assertWriterBehavior(writers) {
    writers.forEach(function (writer) {
        var realm = new FakeRealm('writer "' + writer.name + '" operated on realm during initialization.');
        writer(realm, { type: ActionTypes.INIT });

        realm = new FakeRealm('writer "' + writer.name + '" operated on realm when probed with a random type.' + ('Don\'t try to handle ' + ActionTypes.INIT + ' or other actions in "realm-redux/*" ') + 'namespace. They are considered private.');
        var type = ActionTypes.PROBE_UNKNOWN_ACTION + '_' + Math.random().toString(36);
        writer(realm, { type: type });
    });
}

export default function combineWriters(writers) {
    var finalWriters = [];
    writers.forEach(function (writer) {
        if (typeof writer === 'function') {
            finalWriters.push(writer);
        }
    });
    assertWriterBehavior(finalWriters);

    return function (realm, action) {
        for (var _iterator = finalWriters, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
            var _ref;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref = _i.value;
            }

            var writer = _ref;

            writer(realm, action);
        }
    };
}