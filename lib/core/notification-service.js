'use strict';

var logger = LOGGER.getLogger('NotificationService');

class Notification {

    constructor(type, message, userID){
        this.type = type;
        this.message = message;
        this.userID = userID;
    }

    toJSON(){
        return {
            type: this.type,
            message: this.message,
            userID: this.userID,
        }
    }
}

class NotificationService{

    constructor(system){
        this.system = system;
        this.adapter = null;
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
        var notification = new Notification(type, message, this.system.getCurrentUser().getId());

        var color = function(text){ return text; };
        switch(type){
            case 'error':
                color = chalk.red.inverse;
                break;
        }
        logger.verbose('New notification of type [%s] -> %s', notification.type, color(notification.message));

        this.system.emit('notification:new', notification.toJSON());

        this.save(notification);
    }

    /**
     *
     * @param {Notification} notification
     */
    save(notification){
        this.adapter.save(notification.toJSON());
    }

    /**
     * @param {BaseAdapter} adapter
     */
    setAdapter(adapter){
        this.adapter = adapter;
    }
}

module.exports = NotificationService;