'use strict';

var _ = require('lodash');
var google = require('googleapis');
var util= require('util');

module.exports = function(server, router){

    var self = server;
    var UserDao = server.system.orm.models.User;

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
    router.get('/users/:id/external-services', function(req, res){

        var id = req.params.id;

        var status = [
            {
                name: 'google',
                status: 'NOT_CONNECTED'
            }
        ];

        server.system.orm.models.User.findById(id)
            .then(function(user){

                // check google status
                var googleStatus = _.find(status, { name: 'google'});

                return server.services.get('GoogleService').checkStatus(user)
                    .then(function(status){
                        if(status){
                            googleStatus.status = 'CONNECTED';
                        }
                    });
            })
            .then(function(){
                return res.ok({
                    status: status
                });
            })
            .catch(function(err){
                return res.serverError(err);
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
                    server.system.bus.emit('user:updated', updated.id);
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

    router.post("/users", function(req, res) {
        throw new Error("df");
    });

    return router;
};

