'use strict';

var _ = require('lodash');
var Adapter = require('./speaker-adapter.js');
var config = require('../config.js').coreModule;

/**
 *
 */
class Module{

    constructor(helper) {
        var self = this;
        this.helper = helper;
        this.options = this.helper.getUserOptions();
    }

    initialize(cb)
    {
        var self = this;

        // Listen for user option change
        this.helper.onUserOptionsChange(function(options){
            self.options = self.helper.getUserOptions();
        });

        // Create speaker adapter and register it!
        var adapter = new Adapter(this.helper);
        adapter.init(function(err){
            if(err){
                // Some errors are not internal but require some user actions
                if(err.code === "LIBRARY_NOT_FOUND"){
                    self.helper.notify('error', 'Unable to register speak adapter: ' + err.message);
                    return cb();
                }
                return cb(err);
            }

            self.helper.registerSpeakerAdapter(adapter);
            return cb();
        });
    }

    getConfig(){
        return config;
    }
}

module.exports = Module;