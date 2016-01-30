'use strict';

var AbstractHelper = require(LIB_DIR + '/plugins/abstract-helper.js');
var logger = LOGGER.getLogger('ModuleHelper');

class ModuleHelper extends AbstractHelper{

    /**
     *
     * @param daemon
     * @param module
     */
    constructor(daemon, module){
        super(daemon, module);
        this.daemon = daemon;
        this.module = module;
        this.logger = LOGGER.getLogger('Module [' + this.module.id + ']');
    }

    onNewTask(cb){
        logger.log('listen for ' + this.module.id + ':task:new');
        MyBuddy.on(this.module.id + ':task:new', function(task){
            cb(task);
        });
    }
}

module.exports = ModuleHelper;