'use strict';

var AbstractWrapper = require(LIB_DIR + '/plugin-wrappers/abstract-wrapper.js');

class CoreModule extends AbstractWrapper{

    constructor(id, instance){
        super(MyBuddy);
        this.id = id;
        this.instance = instance;
    }

    /**
     * Return the plugin config.
     * @returns {object}
     */
    getConfig(){
        return this.instance.getConfig();
    }

    setInstance(instance){
        this.instance = instance;
    }
}

module.exports = CoreModule;