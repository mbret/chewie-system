'use strict';

var EventEmitter    = require('events').EventEmitter;
var logger          = LOGGER.getLogger('CustomEventEmitter');

class CustomEventEmitter extends EventEmitter{
    constructor(){
        super();
    }
    emit(e){
        logger.debug('Event [%s] emitted on [%s]', e, this.constructor.name);
        super.emit.apply(this, arguments);
    }
}

module.exports = CustomEventEmitter;