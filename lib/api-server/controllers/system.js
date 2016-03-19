'use strict';

module.exports = function(server, router){

    router.get('/runtime/profile', function(req, res){
        var profile = server.system.userHandler.getProfile();
        if(profile === null){
            return res.status(404).send();
        }
        return res.send(profile.toJSON());
    });

    router.post('/runtime/profile', function(req, res){
        var id = req.body.id;
        
        server.system.userHandler.startProfile(id, function(err, user){
            if(err){
                return res.status(500).send(err.stack);
            }
            return res.send(user);
        });
    });

    /**
     * 
     */
    router.delete('/runtime/profile', function(req, res){

        server.system.userHandler.stopProfile(function(err, user){
            if(err){
                return res.status(500).send(err.stack);
            }
            return res.send(user);
        });
    });

    return router;
};