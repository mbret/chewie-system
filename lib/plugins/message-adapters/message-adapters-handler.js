'use strict';

var _ = require('lodash');
var logger = LOGGER.getLogger('MessageAdaptersHandler');

class MessageAdaptersHandler{

    executeMessage(task, message){
        _.forEach(task.messageAdapters, function(id){
            var adapter = MyBuddy.messenger.getAdapter(id);

            if(adapter === null){
                logger.warn('The message adapter ' + task.messageAdapters + ' does not seems to be loaded. Unable to execute message');
                return;
            }

            adapter.executeMessage(message);
        });
    }
}

module.exports = MessageAdaptersHandler;