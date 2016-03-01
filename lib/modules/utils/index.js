'use strict';

var mkdirp = require('mkdirp');
var _ = require('lodash');

class Utils{

    static initDirsSync(dirs){
        dirs.forEach(function(dir){
            mkdirp.sync(dir);
        });
    }

    static inject(module){
        module.$inject = {};
        _.forEach(arguments, function(object, key){
            if(key == '0') return;
            module.$inject[object.constructor.$injectRef] = object;
        });
    }
}

module.exports = Utils;