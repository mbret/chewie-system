'use strict';

var _ = require('lodash');
var google = require('googleapis');
var util= require('util');
import * as validator from "validator";

module.exports = function(server, router){

    var self = server;
    var UserDao = server.orm.models.User;

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

        server.orm.models.User.findById(id)
            .then(function(user){

                // check google status
                var googleStatus = _.find(status, { name: 'google'});

                return server.services.googleService.checkStatus(user)
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
            .catch(res.serverError);
    });

    /**
     * Retrieve given user info
     */
    router.get('/users/:id', function(req, res){
        var id = req.params.id;
        var search: any = {};

        if(validator.isInt(id)) {
            search.id = id;
        }
        else if (validator.isUsername(id)) {
            search.username = id;
        }
        else {
            return res.badRequest("Invalid id");
        }

        UserDao.findOne({where: search})
            .then(function(user){
                if(!user){
                    return res.notFound();
                }
                return res.ok(user.toJSON())
            })
            .catch(res.serverError);
    });

    router.put('/users/:id', function(req, res){
        var id = req.params.id;
        var config = req.body.config;
        var toUpdate: any = {};

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
                    // server.system.notificationService.push('success', util.format('The user %s has been updated', updated.username));
                    server.system.bus.emit('user:updated', updated.id);
                    return res.ok(updated.toJSON());
                });
            })
            .catch(res.serverError);
    });

    router.get('/users', function(req, res){
        UserDao.findAll()
            .then(function(users){
                return res.send(UserDao.toJSON(users));
            })
            .catch(res.serverError);
    });

    /**
     * Create a user
     * - Validation rely on ORM
     */
    router.post("/users", function(req, res) {
        var username = req.body.username;
        var lastName = req.body.lastName;
        var firstName = req.body.firstName;
        var role = req.body.role;

        var user = {
            username: username,
            lastName: lastName,
            firstName: firstName,
            role: role
        };

        UserDao.create(user)
            .then(function(created) {
                server.logger.verbose("User %s created with id %d and role %s", created.username, created.id, created.role);
                return res.created(created);
            })
            .catch(res.serverError);
    });

    return router;
};

