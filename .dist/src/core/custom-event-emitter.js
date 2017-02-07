'use strict';
var EventEmitter = require('events').EventEmitter;
class CustomEventEmitter extends EventEmitter {
    constructor() {
        super();
    }
    emit(e) {
        super.emit.apply(this, arguments);
    }
}
module.exports = CustomEventEmitter;
//# sourceMappingURL=custom-event-emitter.js.map