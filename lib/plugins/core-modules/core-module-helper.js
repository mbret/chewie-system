'use strict';

var AbstractHelper = require(LIB_DIR + '/plugins/abstract-helper.js');

class CoreModuleHelper extends AbstractHelper{

    /**
     *
     * @param daemon
     * @param CoreModule coreModule
     */
    constructor(daemon, coreModule){
        super(daemon, module);
        this.daemon = daemon;
        this.coreModule = coreModule;
        this.logger = LOGGER.getLogger('Core Module [' + this.module.id + ']');
    }

    registerSpeakAdapter(adapter){
        MyBuddy.speak.setAdapter(adapter);
    }
}

module.exports = CoreModuleHelper;