'use strict';

var _ = require('lodash');

/**
 *
 */
class Adapter{

    constructor(helper)
    {
        this.helper = helper;
    }

    play(){
        this.helper.getLogger().warn('coucou');
    }

}

module.exports = Adapter;