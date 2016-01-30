'use strict';

var AbstractHelper = require(LIB_DIR + '/plugins/abstract-helper.js');

class MessageAdapterHelper extends AbstractHelper{

    /**
     *
     * @param daemon
     * @param adapter
     */
    constructor(daemon, adapter){
        super(daemon, adapter);
        this.adapter = adapter;
        this.logger = LOGGER.getLogger('Message adapter [' + adapter.id + ']');
    }

    setConfig(config){
        this.adapter.setConfig(config);
        return this;
    }

    //getDaemon(){
    //    return this.daemon;
    //}

    //getUserConfig(){
    //    return this.adapter.userConfig;
    //}

    getSpeaker(){
        return MyBuddy.speak;
    }
}

module.exports = MessageAdapterHelper;