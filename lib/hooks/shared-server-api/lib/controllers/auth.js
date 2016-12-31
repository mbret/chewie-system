'use strict';
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var validator = require("validator");
module.exports = function (server, router) {
    var userService = server.services.usersService;
    var UserDao = server.orm.models.User;
    router.post('/auth/signin', function (req, res) {
        let username = req.body.login;
        let search = {};
        if (!username || !validator.isUsername(username)) {
            return res.badRequest("bad credentials");
        }
        search.username = username;
        UserDao
            .findOne({ where: search })
            .then(function (user) {
            if (!user) {
                return res.badRequest("bad credentials");
            }
            var token = jwt.sign({ id: user.id }, server.system.config.auth.jwtSecret);
            return res.json({
                data: userService.formatUser(user.toJSON()),
                token: token
            });
        })
            .catch(res.serverError);
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
