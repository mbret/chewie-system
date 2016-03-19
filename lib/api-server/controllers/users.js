'use strict';

var _ = require('lodash');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var logger = LOGGER.getLogger('UserController');
var User = require(CORE_DIR + '/users').User;

module.exports = function(server, router){

    var self = server;

    function _getGoogleOauthClient(user){

        // Google api account not created by user
        if(!user.getConfig().externalServices.google.auth.clientId || !user.getConfig().externalServices.google.auth.clientSecret){
            return null;
        }

        var oauth2Client = new OAuth2(user.getConfig().externalServices.google.auth.clientId, user.getConfig().externalServices.google.auth.clientSecret, 'dummy');

        if(!user.getCredentials().google.accessToken || !user.getCredentials().google.refreshToken){
            return null;
        }

        oauth2Client.setCredentials({
            access_token: user.getCredentials().google.accessToken,
            refresh_token: user.getCredentials().google.refreshToken
        });

        return oauth2Client;
    }

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
    router.get('/users/external-services-status/:id', function(req, res){

        var id = req.params.id;
        var plus = google.plus('v1');

        server.daemon.database.getAdapter('users').fetchOne(id)
            .then(function(data){
                var user = new User(server, data);
                var oauth = _getGoogleOauthClient(user);

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
            }).catch(function(err){
                return res.status(500).send(err.stack);
            });
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
        var userConfig = MyBuddy.getCurrentProfile().getConfig();
        _.forEach(config, function(value, key){
            if(_.has(userConfig, key)){
                _.set(userConfig, key, value);
            }
        });

        MyBuddy.getCurrentProfile().save();

        return res.send('sdf');
    });

    /**
     * Retrieve given user info
     */
    router.get('/users/:id', function(req, res){
        var id = req.params.id;

        return res.status(200).send(self.daemon.getCurrentProfile().toJSON());
    });
    
    router.get('/users', function(req, res){
        self.daemon.database.getAdapter('users').fetchAll()
            .then(function(data){
                return res.send(data);
            })
            .catch(function(err){
                return res.status(500).send(err.stack);
            });
    });

    return router;
};

