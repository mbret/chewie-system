'use strict';

var _ = require('lodash');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var util= require('util');

module.exports = function(server, router){

    var self = server;
    var UserDao = server.system.orm.models.User;

    function _getGoogleOauthClient(user){

        // Google api account not created by user
        if(!user.config.externalServices.google.auth.clientId || !user.config.externalServices.google.auth.clientSecret){
            return null;
        }

        var oauth2Client = new OAuth2(user.config.externalServices.google.auth.clientId, user.config.externalServices.google.auth.clientSecret, 'dummy');

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

        server.system.orm.models.User.findById(id)
            .then(function(user){
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
    //router.put('/users/config', function(req, res){
    //
    //    var config = req.body;
    //
    //    if(!_.isPlainObject(config)){
    //        return res.status(401, 'Not valid json');
    //    }
    //
    //    // loop over each config key
    //    var userConfig = MyBuddy.getCurrentProfile().getConfig();
    //    _.forEach(config, function(value, key){
    //        if(_.has(userConfig, key)){
    //            _.set(userConfig, key, value);
    //        }
    //    });
    //
    //    MyBuddy.getCurrentProfile().save();
    //
    //    return res.send('sdf');
    //});

    /**
     * Retrieve given user info
     */
    router.get('/users/:id', function(req, res){
        var id = req.params.id;

        UserDao.findOne({where: {id: id}})
            .then(function(user){
                if(!user){
                    return res.notFound();
                }
                return res.ok(user.toJSON())
            })
            .catch(function(err){
                return res.serverError(err);
            });
    });

    router.put('/users/:id', function(req, res){
        var id = req.params.id;
        var config = req.body.config;
        var toUpdate = {};

        // validate body
        var errors = new Map();

        // User config
        // As its a json object that may be updated partially we merge new value with old value
        if(config !== undefined){
            if(!_.isPlainObject(config)){
                errors.set('config', 'Invalid config');
            }
            toUpdate.config = config;
        }

        if(errors.size > 0){
            return res.badRequest(errors);
        }

        UserDao.findOne({where: {id: id}})
            .then(function(user){
                if(!user){
                    return res.notFound();
                }

                // We need to merge config to be sure to overwrite only and not erase
                if(toUpdate.config){
                    toUpdate.config = _.merge(user.config, toUpdate.config);
                }

                return user.update(toUpdate).then(function(updated){
                    server.system.notificationService.push('success', util.format('The user %s has been updated', updated.username));
                    return res.ok(updated.toJSON());
                });
            })
            .catch(function(err){
                return res.serverError(err);
            });
    });

    router.get('/users', function(req, res){
        self.system.orm.models.User.findAll()
            .then(function(users){
                return res.send(self.system.orm.models.User.toJSON(users));
            })
            .catch(function(err){
                return res.status(500).send(err.stack);
            });
    });

    return router;
};

