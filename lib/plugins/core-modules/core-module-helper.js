'use strict';

var AbstractHelper = require(LIB_DIR + '/plugins/abstract-helper.js');

class CoreModuleHelper extends AbstractHelper{

    /**
     *
     * @param daemon
     * @param CoreModule coreModule
     */
    constructor(daemon, coreModule){
        super(daemon, coreModule);
        this.daemon = daemon;
        this.coreModule = this.container;
        this.logger = LOGGER.getLogger('Core Module [' + this.module.id + ']');
    }

    /**
     *
     * @param adapter
     */
    registerSpeakAdapter(adapter){
        MyBuddy.speak.setAdapter(adapter);
    }
}

module.exports = CoreModuleHelper;