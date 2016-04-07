'use strict';

var _ = require('lodash');
var jwt = require('jsonwebtoken');

module.exports = function(server, router){

    router.post('/auth/signin', function(req, res){
        server.system.orm.models.User
            .findOne({where: {username: req.body.login}})
            .then(function(user){
                if(!user){
                    return res.status(400).send('bad credentials');
                }
                var token = jwt.sign({ id: user.id }, server.system.getConfig().auth.jwtSecret);
                return res.json({
                    data: user,
                    token: token
                });
            })
            .catch(function(err){
                return res.status(500).send(err.stack);
            });
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

