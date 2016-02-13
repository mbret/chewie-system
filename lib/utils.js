'use strict';

var fs = require('fs');
var mkdirp = require('mkdirp');

class Utils{

    static getCurrentIp(cb){
        // get address ip to reach server
        require('dns').lookup(require('os').hostname(), function (err, add, fam) {
            return cb(err, add);
        });
    }

    static initDirsSync(dirs){
        dirs.forEach(function(dir){
            mkdirp.sync(dir);
        });
    }
}

module.exports = Utils;