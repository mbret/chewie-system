'use strict';

var _ = require('lodash');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var logger = LOGGER.getLogger('UserController');

module.exports = function(server, router){

    var self = server;

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
            console.log(err, response);
            if(err && err.code === 403){
                return res.send(status);
            }

            googleStatus.status = 'CONNECTED';
            return res.send(status);
        });
    });

    function _getGoogleOauthClient(){

        // Google api account not created by user
        if(!MyBuddy.config.externalServices.google.auth.clientId || !MyBuddy.config.externalServices.google.auth.clientSecret){
            return null;
        }

        var oauth2Client = new OAuth2(MyBuddy.config.externalServices.google.auth.clientId, MyBuddy.config.externalServices.google.auth.clientSecret, 'dummy');

        if(!MyBuddy.user.getCredentials().google.accessToken || !MyBuddy.user.getCredentials().google.refreshToken){
            return null;
        }

        oauth2Client.setCredentials({
            access_token: MyBuddy.user.getCredentials().google.accessToken,
            refresh_token: MyBuddy.user.getCredentials().google.refreshToken
        });

        return oauth2Client;
    }

    return router;
};

