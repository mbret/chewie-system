"use strict";

module.exports = function(system, logger, done){
    system.orm.models.User.findOne({where: {username: 'admin'}})
        .then(function(user){
            return system.orm.models.Plugins.findOrCreate({
                where: {id:'simple-message'},
                defaults: {
                    id: 'simple-message',
                    userId: user.id
                }
            });
        })
        .then(function(){
            return done();
        })
        .catch(done);
};