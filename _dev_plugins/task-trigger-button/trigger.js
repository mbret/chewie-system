'use strict';

var _           = require('lodash');

class Module{

    /**
     *
     * @param helper
     */
    constructor(helper){
        this.helper = helper;
    }

    initialize(cb)
    {
        var self = this;

        // create gpio entity
        //var button = this.helper.gpio(17, 'out');

        // Listen for press
        button.watch(function(err, value) {
            this.helper.getLogger().info('button pressed');

            // process all task
            self.helper.executeTask();
        });

        return cb();
    }

    getConfig(){
        return {};
    }
}

module.exports = Module;