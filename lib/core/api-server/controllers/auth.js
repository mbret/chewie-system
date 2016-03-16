'use strict';

var _ = require('lodash');

module.exports = function(server, router){

    var self = server;

    router.post('/auth/signin', function(req, res){
        self.daemon.userAuthentication.login(req.params.login, req.params.password, function(err){
            if(err){
                return res.status(500).send(err);
            }

            return res.status(200).send(self.daemon.getCurrentUser().toJSON());
        });
    });

    router.get('/auth/signout', function(req, res){
        self.daemon.userAuthentication.logout(function(err){
            if(err){
                return res.status(500).send(err);
            }

            return res.status(200).send();
        });
    });

    return router;
};

