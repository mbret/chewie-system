'use strict';
import {getFolderSize} from "../../../../shared/utils";
var fs = require('fs');
var async = require("async");
var path = require("path");

module.exports = function (router) {
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

    router.get("/_dev/info", function(req, res) {
        var config = self.daemon.getConfig();
        var viewData = {
            layout: "_dev",
            "config": {
                "env": config.env,
                "systemIP": config.systemIP,
                "databaseStorageDir": config.hooks["shared-server-api"].storageFilePath,
                "tmpDir": config.system.tmpDir,
                "dataDir": config.system.appDataPath,
                "pluginsTmpDir": config.system.pluginsTmpDir,
                "pluginsDataDir": config.system.pluginsDataDir,
            },
            "sizes": {
                databaseStorageDir: null,
                tmpDir: null,
                dataDir: null,
                pluginsTmpDir: null,
                pluginsDataDir: null,
            }
        };

        async.parallel([
            // storage dir size
            function(cb) {
                getFolderSize(config.hooks["shared-server-api"].storageFilePath, function(err, size){
                    viewData.sizes.databaseStorageDir = size;
                    return cb(err);
                });
            },
            // tmp dir size
            function(cb) {
                getFolderSize(config.system.tmpDir, function(err, size){
                    viewData.sizes.tmpDir = size;
                    return cb(err);
                });
            },
            // data dir size
            function(cb) {
                getFolderSize(config.system.appDataPath, function(err, size){
                    viewData.sizes.dataDir = size;
                    return cb(err);
                });
            },
            // plugins tmp dir size
            function(cb) {
                getFolderSize(config.system.pluginsTmpDir, function(err, size){
                    viewData.sizes.pluginsTmpDir = size;
                    return cb(err);
                });
            },
            // plugins data dir size
            function(cb) {
                getFolderSize(config.system.pluginsDataDir, function(err, size){
                    viewData.sizes.pluginsDataDir = size;
                    return cb(err);
                });
            },
        ], function(err) {
            if (err) {
                return res.render(err.stack);
            }
            return res.render("_dev-status", viewData);
        });

    });
};
