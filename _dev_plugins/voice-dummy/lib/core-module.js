'use strict';

var _           = require('lodash');
var config      = require('../config.js');

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

        return cb();
    }
}

module.exports = Module;