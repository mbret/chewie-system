'use strict';

var logger = LOGGER.getLogger("Core module - im-awake");

/**
 * This module watch for the state of daemon and communicate on it through
 * via the Redis pipe
 */
class ImAwake{

    constructor(){

        this.config = {
            interval: 10000
        }
    }

    initialize(){

        setInterval(function(){
            // listen to redis pipe to answer
            logger.verbose('push redis info, daemon still awake');
        }, this.config.interval);
    }

}
module.exports = ImAwake;