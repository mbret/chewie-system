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

        console.log(config);

        if(!_.isPlainObject(config)){
            return res.status(401, 'Not valid json');
        }

        // loop over each config key
        _.forEach(config, function(value, key){
           console.log(value, key);
            if(_.has(MyBuddy.user.getConfig(), key)){
                console.log('has key');
            }
            else{
                console.log('has not key');
            }
        });
        /*
         * 'externalServices.google.auth.clientId': 'foof',
         * 'externalServices.google.auth.clientSecret': 'foof',
         *
         * !_.has(config, 'externalServices.google.auth.clientId') -> 401
         *
         *  _.set(config...
         */
        // update system config
        //MyBuddy.config = _.merge(MyBuddy.config, config);

        return res.send('sdf');
    });


    return router;
};

