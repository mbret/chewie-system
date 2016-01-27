'use strict';

var EventEmitter = require('events').EventEmitter;
var logger = LOGGER.getLogger('Plugin Abstract Wrapper');

class Model extends EventEmitter{

    constructor(daemon){
        super();
        this.daemon = daemon;
    }

    /**
     * Notify the entire system.
     *
     * Use the daemon event bus to attach a notification.
     * Module are free to listen on this event.
     *
     * @param type
     * @param message
     */
    notify(type, message){
        logger.verbose(this.constructor.name + ':notify:' + type + ':' + message);
        this.daemon.emit('notification:new', {type: type, message: message});
    }
}

module.exports = Model;