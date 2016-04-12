'use strict';

var AbstractHelper = require(CORE_DIR + '/plugins/abstract-helper.js');

class CoreModuleHelper extends AbstractHelper{

    constructor(daemon, coreModule){
        super(daemon, coreModule);
        this.daemon = daemon;
        this.coreModule = this.container;
        this.logger = LOGGER.getLogger('Core Module [' + this.module.id + ']');
    }

    registerSpeakerAdapter(adapter){

        if(!adapter.playFile){
            throw new Error('Your adapter does not support playFile method');
        }

        this.daemon.speaker.setAdapter(adapter);
    }
}

module.exports = CoreModuleHelper;