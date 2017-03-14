const nodemailer = require("nodemailer");
const google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var plus = google.plus('v1');
var gmail = google.gmail('v1');


/**
 *
 */
class Hook {

    /**
     * @param chewie
     */
    constructor(chewie) {
        this.chewie = chewie;
    }

    /**
     * @returns {Promise}
     */
    initialize() {

        var oauth2Client = new OAuth2(
            "143547074111-mesc8tu47lee0u59adkmrgi68fvl1npt.apps.googleusercontent.com",
            "HoniabzEH67kz7MBvRqLcsiG"
            // "https://localhost:3000"
        );

        oauth2Client.setCredentials({
            access_token: 'ya29.GlsOBE8axVg7uNtExK34ZVt1lyXtmM_Ar8j4YoTp6PT3xZAtP6zU7yuADrBxp3ZP_Ai471uQeiM0mvRx0ZB3HLHpfGvhYwnKsdU5C50DAgikqHjgnSx2RMxbSKxF',
            refresh_token: '1/tPb2tp9g7owApWVWDp1RLOazOuL3viaW7wo-ue0QwgA'
            // Optional, provide an expiry_date (milliseconds since the Unix Epoch)
            // expiry_date: (new Date()).getTime() + (1000 * 60 * 60 * 24 * 7)
        });

        plus.people.get({
            userId: 'me',
            auth: oauth2Client
        }, function (err, response) {
            console.log("err", err);
            console.log("response", response);
        });
        //
        // gmail.users.labels.list({
        //     auth: oauth2Client,
        //     userId: 'me',
        // }, function(err, response) {
        //     console.log("err", err);
        //     console.log("response", response);
        // });

        // gmail.users.getProfile({
        //     auth: oauth2Client,
        //     userId: 'me',
        // }, function(err, response) {
        //     console.log("err", err);
        //     console.log("response", response);
        // });

        return Promise.resolve();
    }
}

module.exports = Hook;