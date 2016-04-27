'use strict';

var AbstractHelper = require(CORE_DIR + '/plugins/abstract-helper.js');

class MessageAdapterHelper extends AbstractHelper{

    constructor(daemon, adapter){
        super(daemon, adapter);
        this.logger = MyBuddy.logger.Logger.getLogger('Message adapter [' + adapter.id + ']');
    }
}

module.exports = MessageAdapterHelper;