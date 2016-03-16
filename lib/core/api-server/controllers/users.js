'use strict';

var _ = require('lodash');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var logger = LOGGER.getLogger('UserController');

module.exports = function(server, router){

    var self = server;

    //router.get('/users/current', function(req, res){
    //    var json = MyBuddy.user.toJSON();
    //
    //    // security
    //    delete json.credentials;
    //
    //    res.send(json);
    //});

    /**
     * Return the status of all external status
     */
    router.get('/users/external-services-status', function(req, res){

        var plus = google.plus('v1');

        var oauth = _getGoogleOauthClient();

        var status = [
            {
                name: 'google',
                status: 'NOT_CONNECTED'
            }
        ];

        if(oauth === null){
            return res.send(status);
        }

        // check google status
        var googleStatus = _.find(status, { name: 'google'});
        plus.people.get({ userId: 'me', auth: oauth }, function(err, response){
            if(err && err.code === 403){
                return res.send(status);
            }

            googleStatus.status = 'CONNECTED';
            return res.send(status);
        });
    });

    function _getGoogleOauthClient(){

        // Google api account not created by user
        if(!MyBuddy.getCurrentUser().getConfig().externalServices.google.auth.clientId || !MyBuddy.getCurrentUser().getConfig().externalServices.google.auth.clientSecret){
            return null;
        }

        var oauth2Client = new OAuth2(MyBuddy.getCurrentUser().getConfig().externalServices.google.auth.clientId, MyBuddy.getCurrentUser().getConfig().externalServices.google.auth.clientSecret, 'dummy');

        if(!MyBuddy.getCurrentUser().getCredentials().google.accessToken || !MyBuddy.getCurrentUser().getCredentials().google.refreshToken){
            return null;
        }

        oauth2Client.setCredentials({
            access_token: MyBuddy.getCurrentUser().getCredentials().google.accessToken,
            refresh_token: MyBuddy.getCurrentUser().getCredentials().google.refreshToken
        });

        return oauth2Client;
    }

    /**
     * Update the user config
     */
    router.put('/users/config', function(req, res){

        var config = req.body;

        if(!_.isPlainObject(config)){
            return res.status(401, 'Not valid json');
        }

        // loop over each config key
        var userConfig = MyBuddy.getCurrentUser().getConfig();
        _.forEach(config, function(value, key){
            if(_.has(userConfig, key)){
                _.set(userConfig, key, value);
            }
        });

        MyBuddy.getCurrentUser().save();

        return res.send('sdf');
    });

    /**
     * Retrieve given user info
     */
    router.get('/users/:id', function(req, res){
        var id = req.params.id;

        return res.status(200).send(self.daemon.getCurrentUser().toJSON());
    });

    return router;
};

