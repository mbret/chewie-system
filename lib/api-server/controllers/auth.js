'use strict';

var _ = require('lodash');
var jwt = require('jsonwebtoken');

module.exports = function(server, router){

    var self = server;

    /**
     *
     */
    router.post('/auth/signin', function(req, res){
        self.daemon.database.getAdapter('users')
            .fetchOne({login: req.body.login})
            .then(function(data){
                var token = jwt.sign({ id: data._id }, server.system.getConfig().auth.jwtSecret);
                return res.json({
                    data: data,
                    token: token
                });
            })
            .catch(function(err){
                return res.status(500).send(err.stack);
            });
    });

    router.get('/auth/signout', function(req, res){
        self.daemon.userAuthentication.logout(function(err){
            if(err){
                return res.status(500).send(err.stack);
            }

            return res.status(200).send();
        });
    });

    return router;
};

