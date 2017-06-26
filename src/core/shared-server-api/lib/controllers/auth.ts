'use strict';

let _ = require('lodash');
let jwt = require('jsonwebtoken');
import * as nodeValidator from "validator";
const expressJwt = require('express-jwt');

module.exports = function (server, router) {

    let validator: any = nodeValidator; // workaround typescript because of redefinition
    let userService = server.services.usersService;
    let UserDao = server.orm.models.User;

    /**
     * Return the status of current authentication
     */
    router.get("/auth/status", (req, res) => {
        expressJwt({secret: server.system.config.sharedServerApi.auth.jwtSecret})(req, req, (err) => {
            if (err) {
                return res.ok({
                    status: 'unauthorized'
                })
            }
            return res.ok({
                status: "authorized",
                id: req.user.id,
                type: req.user.type
            });
        })
    });

    /**
     * Return user + jwt token
     */
    router.post('/auth/signin', function (req, res) {

        let username = req.body.username;
        let appName = req.body.appName;
        let password = req.body.password;
        let secretPassword = req.body.secretPassword;
        let search: any = {};

        // detect secret password
        // only app are allowed to signin without username
        if (!password && secretPassword === server.system.config.sharedServerApi.auth.secretPassword) {
            if (!appName || validator.isEmpty(appName)) {
                return res.badRequest({data: {errors: {appName: "required"}}});
            }

            let payload = {id: appName, role: null, type: "app"};
            let token = jwt.sign(payload, server.system.config.sharedServerApi.auth.jwtSecret, {expiresIn: server.system.config.sharedServerApi.auth.expiresIn});
            return res.json({
                data: null,
                token: token
            });
        }
        // User context
        else {
            if (!username || !validator.isUsername(username)) {
                return res.badRequest({data: {errors: {username: "required"}}});
            }

            search.username = username;

            UserDao
                .findOne({where: search})
                .then(function(user){
                    if(!user){
                        return res.badRequest();
                    }
                    let payload = { id: user.id, role: user.role };
                    let token = jwt.sign(payload, server.system.config.auth.jwtSecret, { expiresIn: server.system.config.auth.expiresIn, header: {foo: 'sdf'} });
                    return res.json({
                        data: userService.formatUser(user.toJSON()),
                        token: token
                    });
                })
                .catch(res.serverError);
        }
    });

    router.get('/auth/signout', function (req, res) {
        server.userAuthentication.logout(function (err) {
            if (err) {
                return res.status(500).send(err.stack);
            }

            return res.status(200).send();
        });
    });
};