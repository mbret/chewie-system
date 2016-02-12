'use strict';

var _ = require('lodash');

module.exports = function(server, router){

    var self = server;

    router.get('/users/current', function(req, res){
        var json = MyBuddy.user.toJSON();

        // security
        delete json.credentials;

        res.send(json);
    });

    /**
     * Return the status of all external status
     */
    router.get('/users/external-services-status', function(req, res){

        var status = [
            {
                name: 'google',
                status: 'NOT_CONNECTED'
            }
        ];
        res.send(status);
    });

    /**
     * Update the user config
     */
    router.put('/users/config', function(req, res){

        var config = req.body;

        if(!_.isPlainObject(config)){
            return res.status(401, 'Not valid json');
        }

        // loop over each config key
        var userConfig = MyBuddy.user.getConfig();
        _.forEach(config, function(value, key){
            if(_.has(userConfig, key)){
                _.set(userConfig, key, value);
            }
        });

        MyBuddy.user.save();

        return res.send('sdf');
    });


    return router;
};

