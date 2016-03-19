'use strict';

var _ = require('lodash');

module.exports = function(server, router){

    var self = server;

    router.post('/auth/signin', function(req, res){
        self.daemon.database.getAdapter('users')
            .fetchOne({login: req.body.login})
            .then(function(data){
                return res.status(200).send(data);
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

