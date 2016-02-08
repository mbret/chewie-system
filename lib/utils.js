'use strict';

class Utils{

    static getCurrentIp(cb){
        // get address ip to reach server
        require('dns').lookup(require('os').hostname(), function (err, add, fam) {
            return cb(err, add);
        });
    }
}

module.exports = Utils;