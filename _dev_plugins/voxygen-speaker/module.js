'use strict';

var _ = require('lodash');
var Adapter = require('./lib/adapter.js');

/**
 *
 */
class Module{

    constructor(helper)
    {
        var self = this;
        this.helper = helper;
    }

    initialize(cb)
    {
        var adapter = new Adapter(this.helper);
        this.helper.registerSpeakAdapter(adapter);
        return cb();
    }

}

module.exports = Module;