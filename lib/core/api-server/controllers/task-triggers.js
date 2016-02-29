'use strict';

var _ = require('lodash');

module.exports = function(server, router){

    router.get('/task-triggers', function(req, res){
        var entries = [];
        _.forEach(MyBuddy.taskTriggers, function(entry){
            var tmp = entry.toJSON();
            entries.push(tmp);
        });

        return res.send(entries);
    });

    return router;
};