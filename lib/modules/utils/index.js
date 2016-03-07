'use strict';

var mkdirp = require('mkdirp');
var _ = require('lodash');

class Utils{

    static initDirsSync(dirs){
        dirs.forEach(function(dir){
            mkdirp.sync(dir);
        });
    }
}

module.exports = Utils;