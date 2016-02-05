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
        this.logger = LOGGER.getLogger('Message adapter [' + adapter.id + ']');
    }

    //setConfig(config){
    //    this.container.setConfig(config);
    //    return this;
    //}

    //getDaemon(){
    //    return this.daemon;
    //}

    //getUserConfig(){
    //    return this.adapter.userConfig;
    //}

    onNewMessage(cb){
        this.container.on('message:new', function(options){
            cb(options)
        });
    }
}

module.exports = MessageAdapterHelper;