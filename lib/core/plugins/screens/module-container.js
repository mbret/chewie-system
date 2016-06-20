'use strict';

var _ = require('lodash');
var AbstractContainer = require('./../abstract-container.js');

class ModuleContainer extends AbstractContainer{

    constructor(system, pluginContainer, moduleId, instance, userOptions){
        super(system, pluginContainer, userOptions, instance, moduleId);

        this.logger = system.logger.Logger.getLogger('ModuleContainer');
    }

    saveUserOptions(options, cb){
        if(!cb) cb = function(){};

        // save to db
        MyBuddy.database.getAdapter('plugins').saveUserOptions(this.pluginId, this.id, 'screen', options, function(err){
            return cb(err);
        });
    }
}

module.exports = ModuleContainer;