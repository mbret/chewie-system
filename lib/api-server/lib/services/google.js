"use strict";

var _ = require('lodash');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var plus = google.plus('v1');

function GoogleService(system){
    this.system = system;

}

GoogleService.prototype.prepareOauthClient = function(user){
    var googleUserConf = user.config.externalServices.google;

    googleUserConf.auth.clientId = '143547074111-r7r5r57apv1vsi9qnvaqmsjkaug4rb2u.apps.googleusercontent.com';
    googleUserConf.auth.clientSecret = 'R59NJByP6gJMfyW90uiPUt8_';

    console.log(googleUserConf);

    // Google api account not created by user
    //if(!googleUserConf.auth.clientId || !googleUserConf.auth.clientSecret){
    //    return resolve;
    //}

    var oauth2Client = new OAuth2(googleUserConf.auth.clientId, googleUserConf.auth.clientSecret, 'dummy');

    //if(!googleUserConf.accessToken || !googleUserConf.refreshToken){
    //    return null;
    //}

    oauth2Client.setCredentials({
        access_token: googleUserConf.accessToken,
        refresh_token: googleUserConf.refreshToken
    });
};

GoogleService.prototype.checkStatus = function(user){
    var self = this;
    return new Promise(function(resolve){

        var oauth = self.prepareOauthClient(user);

        // Try to get info from current user
        // In case we receive a 403 it means the user is not allowed to retrieve its profile (or any profile) or any
        // other error because we should be signed up. Then the credentials are invalid so not connected
        plus.people.get({ userId: 'me', auth: oauth }, function(err, response){
            console.log(err, response);
            if(err && err.code === 403){
                return resolve(false);
            }

            return resolve(true);
        });
    });
};

module.exports = GoogleService;