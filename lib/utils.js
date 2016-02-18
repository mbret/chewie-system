'use strict';

var mkdirp = require('mkdirp');

class Utils{

    static initDirsSync(dirs){
        dirs.forEach(function(dir){
            mkdirp.sync(dir);
        });
    }
}

module.exports = Utils;