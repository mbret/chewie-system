'use strict';

var logger = LOGGER.getLogger('NotificationService');

class NotificationService{

    constructor(system){
        this.system = system;
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
    add(type, message){
        var notification = {
            type: type,
            message: message
        };

        var color = function(text){ return text; }
        switch(type){
            case 'error':
                color = chalk.red.inverse;
                break;
        }
        logger.verbose('New notification of type [%s] -> %s', notification.type, color(notification.message));

        this.system.emit('notification:new', notification);

        // save to db
        this.system.database.saveNotif(notification);
    }
}

module.exports = NotificationService;