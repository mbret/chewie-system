'use strict';

let fs = require('fs');
let path = require("path");
import * as validator from "validator";

module.exports = function (router) {

    router.post('/sound', function(req, res){

        let resourcePath = req.body.resourcePath;

        // We have a resource to play
        if(typeof resourcePath === "string"){
            if(validator.isLength(resourcePath, {min:1})){
                setImmediate(function() {
                    req.app.locals.system.speaker.playFile(path.resolve(req.app.locals.system.config.resourcesDir, resourcePath));
                });
            }
        }

        return res.ok();
    });

    // router.get('/runtime/profile', function(req, res){
    //     let profile = req.app.locals.system.runtime.profileManager.getActiveProfile();
    //     if(profile === null){
    //         return res.status(404).send();
    //     }
    //     return res.status(200).send(profile);
    // });

    router.post('/runtime/profile', function(req, res){
        var id = req.body.id;

        // UserDao.findById(id)
        //     .then(function(user){
        //         if(!user){
        //             return res.status(400).send('invalid user id');
        //         }
        //         return req.app.locals.system.profileManager.startProfile(user.username);
        //     })
        //     .then(function(){
        //         req.app.locals.system.notificationService.push('success', 'Profile started');
        //         return res.status(201).send();
        //     })
        //     .catch(function(err){
        //         req.app.locals.system.notificationService.push('error', 'Profile failed to start');
        //         res.status(500).send(err.stack);
        //     });
    });

    router.delete('/runtime/profile', function(req, res){

        return req.app.locals.system.profileManager.stopProfile()
            .then(function(){
                req.app.locals.system.notificationService.push('success', 'Profile stopped');
                res.status(200).send();
            })
            .catch(function(err){
                req.app.locals.system.notificationService.push('error', 'Profile failed to stop');
                res.status(500).send(err.stack);
            });
    });
};
