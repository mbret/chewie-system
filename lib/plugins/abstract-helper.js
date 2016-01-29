'use strict';

/**
 * Module helper.
 */
class AbstractHelper{

    constructor(daemon, module){
        this.daemon = daemon;
        this.module = module;
    }

    notify(type, message){
        this.module.notify(type, message);
    }

    /**
     * Execute message for the specified task
     * @param task
     * @param message
     */
    executeMessage(task, message){
        var self = this;
        logger.debug('execute message for adapters [' + task.messageAdapters + ']');

        _.forEach(task.messageAdapters, function(id){
            var adapter = MyBuddy.messenger.getAdapter(id);

            if(adapter === null){
                self.notify('error', 'The message adapter ' + task.messageAdapters + ' does not seems to be loaded. Unable to execute message');
                return;
            }

            adapter.executeMessage(message);
        });
    }

    executeGpio(){
        this.daemon.executeGpio();
    }

    getLogger(){
        return this.logger;
    }
}

module.exports = AbstractHelper;