'use strict';

module.exports = function(app, router){

    var self = this;

    /**
     * Return the configuration as json for app
     */
    router.get('/configuration.js', function(req, res){

        // determine api server ip
        // Serve localhost if same ip (avoid problem with certificate)
        var apiUrl = self.daemon.apiServer.getLocalAddress();

        // When outside of localhost, use real ip.
        if(req.ip !== '::1'){
            apiUrl = self.daemon.apiServer.getRemoteAddress();
        }

        var config = {
            apiUrl: apiUrl,
            systemConfig: self.daemon.configHandler.getConfig()
        };

        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', 0);
        res.send('window.SERVER_CONFIG = ' + JSON.stringify(config) + ';');
    });

    /**
     * Auth to google
     * https://developers.google.com/drive/v3/web/quickstart/nodejs
     */
    router.get('/auth/google', function(req, res){

        if(!self.daemon.user.getConfig().externalServices.google.auth.clientId || !self.daemon.user.getConfig().externalServices.google.auth.clientSecret){
            return res.status(400).send('Please set your credentials first');
        }

        // generate a url that asks permissions for Google+ and Google Calendar scopes
        var scopes = [
            'https://www.googleapis.com/auth/plus.me',
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/drive'
        ];

        var url = oauth2Client.generateAuthUrl({
            access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
            scope: scopes // If you only need one scope you can pass it as string
        });

        return res.redirect(url);
    });

    /**
     * Auth to google callback
     *
     */
    router.get('/auth/google/callback', function(req, res){

        var authCode = req.query.code;

        if(!self.daemon.user.getConfig().externalServices.google.auth.clientId || !self.daemon.user.getConfig().externalServices.google.auth.clientSecret){
            return res.status(400).send('Please set your credentials first');
        }

        oauth2Client.getToken(authCode, function(err, tokens) {
            if(err){
                return res.status(500).send(err);
            }

            // Now tokens contains an access_token and an optional refresh_token. Save them.
            self.daemon.user.getCredentials().google.accessToken = tokens.access_token;
            self.daemon.user.getCredentials().google.refreshToken = tokens.refresh_token;
            self.daemon.user.save();

            return res.send(self.daemon.user.getCredentials());
        });
    });

    /**
     * https://developers.google.com/drive/v3/web/quickstart/nodejs
     */
    router.get('/test/google', function(req, res){
        var oauth = self._getGoogleOauthClient();

        var plus = google.plus('v1');
        var drive = google.drive({ version: 'v3', auth: oauth });

        //plus.people.get({ userId: 'me', auth: oauth }, function(err, response){
        //    console.log(err, response);
        //});

        drive.files.list({
            pageSize: 10,
            fields: "nextPageToken, files(id, name)"
        }, function(err, response) {
            return res.send({
                err: err,
                response: response
            })
        });

    });

    /**
     * Bootstrap
     */
    router.get('/', function(req, res){
        return res.render('index');
    });

    app.use('/', router);
};