'use strict';

var _ = require('lodash');
var Task = require(LIB_DIR + '/plugins/tasks/task.js').Task;

module.exports = function(server, router){

    /**
     * Return all the users modules.
     */
    router.get('/users-modules', function(req, res){
        var modules = MyBuddy.userModules;
        var tmp = [];

        _.forEach(modules, function(module, name){
            var moduleConfig = module.getConfig();
            tmp.push({
                name: name,
                config: moduleConfig,
                module: null
            });
        });

        return res.send(tmp);
    });

    return router;
};