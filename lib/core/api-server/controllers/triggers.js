'use strict';

var _ = require('lodash');

module.exports = function(server, router){

    var self = this;

    router.get('/triggers', function(req, res){
        var entries = [];
        _.forEach(self.daemon.triggers, function(entry){
            var tmp = entry.toJSON();
            entries.push(tmp);
        });

        return res.send(entries);
    });

    return router;
};