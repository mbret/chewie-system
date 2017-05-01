'use strict';

let _ = require('lodash');
let jwt = require('jsonwebtoken');
import * as nodeValidator from "validator";

module.exports = function(server, router) {

    let validator: any = nodeValidator; // workaround typescript because of redefinition
    let userService = server.services.usersService;
    let UserDao = server.orm.models.User;

    /**
     * Return user + jwt token
     */
    router.post('/auth/signin', function(req, res){

        let username = req.body.login;
        let search: any = {};

        if(!username || !validator.isUsername(username)) {
            return res.badRequest("bad credentials");
        }

        search.username = username;

        UserDao
            .findOne({where: search})
            .then(function(user){
                if(!user){
                    return res.badRequest("bad credentials");
                }
                let payload = { id: user.id, role: user.role };
                let token = jwt.sign(payload, server.system.config.sharedServerApi.auth.jwtSecret, { expiresIn: server.system.config.sharedServerApi.auth.expiresIn });
                return res.json({
                    data: userService.formatUser(user.toJSON()),
                    token: token
                });
            })
            .catch(res.serverError);
    });

    router.get('/auth/signout', function(req, res){
        server.userAuthentication.logout(function(err){
            if(err){
                return res.status(500).send(err.stack);
            }

            return res.status(200).send();
        });
    });
};