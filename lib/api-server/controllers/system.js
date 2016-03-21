'use strict';

module.exports = function(server, router){

    var UserDao = server.system.orm.models.User;

    router.get('/runtime/profile', function(req, res){
        var profile = server.system.profileManager.getActiveProfile();
        if(profile === null){
            return res.status(404).send();
        }
        return res.status(200).send(profile);
    });

    router.post('/runtime/profile', function(req, res){
        var id = req.body.id;

        UserDao.findById(id)
            .then(function(user){
                if(!user){
                    return res.status(400).send('invalid user id');
                }
                return server.system.profileManager.startProfile(id);
            })
            .then(function(){
                server.system.notificationService.add('success', 'Profile started');
                return res.status(201).send();
            })
            .catch(function(err){
                server.system.notificationService.add('error', 'Profile failed to start');
                res.status(500).send(err.stack);
            });
    });

    /**
     * 
     */
    router.delete('/runtime/profile', function(req, res){

        return server.system.profileManager.stopProfile()
            .then(function(){
                server.system.notificationService.add('success', 'Profile stopped');
                res.status(200).send();
            })
            .catch(function(err){
                server.system.notificationService.add('error', 'Profile failed to stop');
                res.status(500).send(err.stack);
            });
    });

    return router;
};