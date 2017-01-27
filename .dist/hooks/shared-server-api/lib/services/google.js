"use strict";
var _ = require('lodash');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var plus = google.plus('v1');
function GoogleService(system) {
    this.system = system;
}
exports.GoogleService = GoogleService;
GoogleService.prototype.prepareOauthClient = function (user) {
    var googleUserConf = user.config.externalServices.google;
    googleUserConf.auth.clientId = '143547074111-r7r5r57apv1vsi9qnvaqmsjkaug4rb2u.apps.googleusercontent.com';
    googleUserConf.auth.clientSecret = 'R59NJByP6gJMfyW90uiPUt8_';
    var oauth2Client = new OAuth2(googleUserConf.auth.clientId, googleUserConf.auth.clientSecret, 'dummy');
    oauth2Client.setCredentials({
        access_token: googleUserConf.accessToken,
        refresh_token: googleUserConf.refreshToken
    });
};
GoogleService.prototype.checkStatus = function (user) {
    var self = this;
    return new Promise(function (resolve) {
        var oauth = self.prepareOauthClient(user);
        plus.people.get({ userId: 'me', auth: oauth }, function (err, response) {
            if (err && err.code === 403) {
                return resolve(false);
            }
            return resolve(true);
        });
    });
};
//# sourceMappingURL=google.js.map