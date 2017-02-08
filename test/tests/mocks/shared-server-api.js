let EventEmitter = require("events");

class SharedServerApiMock extends EventEmitter {
    constructor() {
        super();
    }

    initialize() {
        return Promise.resolve();
    }
}

module.exports = SharedServerApiMock;