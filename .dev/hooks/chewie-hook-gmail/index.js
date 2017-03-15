const nodemailer = require("nodemailer");
const packageInfo = require("./package.json");
const google = require('googleapis');
let OAuth2 = google.auth.OAuth2;
let plus = google.plus('v1');
let gmail = google.gmail('v1');


/**
 *
 */
class Hook {

    /**
     *
     * @param chewie
     * @param config
     * @param helper
     * @param options
     */
    constructor(chewie, config, helper, options) {
        this.chewie = chewie;
        this.config = config;
        this.helper = helper;
        this.options = options;
    }

    /**
     * @returns {Promise}
     */
    initialize() {
        let self = this;

        this.chewie.on("hook:" + packageInfo.name + ":options:updated", function(newOptions) {
            self.options = newOptions;
            // @todo
        });

        let oauth2Client = new OAuth2(
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

        // plus.people.get({
        //     userId: 'me',
        //     auth: oauth2Client
        // }, function (err, response) {
        //     console.log("err", err);
        //     console.log("response", response);
        // });
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

        // RFC 2822
        let email_lines =[];
        email_lines.push("From: Chewie <chewie@gmail.com>");
        email_lines.push("To:maxime.bret.ext@boursorama.fr ");
        // text/plain works with \r\n
        // text/html works with <br>
        email_lines.push('Content-type: text/html;charset=iso-8859-1');
        email_lines.push('MIME-Version: 1.0');
        email_lines.push("Subject: Testing ");
        email_lines.push("");
        email_lines.push("hai<br>");
        email_lines.push("<b>And henge naavu</b>");
        let email =email_lines.join("\r\n").trim();
        let base64EncodedEmail = new Buffer(email).toString('base64');
        base64EncodedEmail = base64EncodedEmail.replace(/\//g,'_').replace(/\+/g,'-');

        // gmail.users.messages.send({
        //     userId: "me",
        //     resource: {
        //         raw: base64EncodedEmail
        //     },
        //     auth: oauth2Client
        // }, function (err, response) {
        //     console.log("err", err);
        //     console.log("response", response);
        // });

        return Promise.resolve();
    }
}

module.exports = Hook;