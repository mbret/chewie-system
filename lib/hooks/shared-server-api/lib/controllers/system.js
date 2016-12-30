'use strict';

var _ = require('lodash');
var validator = require('validator');
var path = require('path');

module.exports = function(server, router){

    var UserDao = server.orm.models.User;
    var LogsDao = server.orm.models.Logs;
    var self = server;

    router.get('/ping', function (req, res) {
        res.send('pong you moron!');
    });

    /**
     * Make the system speak the given text.
     */
    router.post('/speak', function(req, res){
        var text = req.body.text;

        server.system.speaker.play(text);
        res.sendStatus(200);
    });

    router.get('/shutdown', function(req, res){
        res.sendStatus(200);
        self.system.shutdown();
    });

    router.get('/restart', function(req, res){
        setTimeout(function(){ self.system.restart() }, 1);
        return res.sendStatus(200);
    });

    router.get('/system', function(req, res){

        return res.status(200).send(_.merge(server.system.info, {
            uptime: process.uptime()
        }));
    });

    // router.post('/speech/commands', function(req, res){
    //
    //     var command = req.body.command;
    //
    //     MyBuddy.speechHandler.executeCommand(command);
    //
    //     return res.sendStatus(201);
    // });

    // router.get('/speech/commands', function(req, res){
    //     var tmp = MyBuddy.speechHandler.getCommands();
    //
    //     var toSend = tmp.map(function(entry){
    //         return {
    //             command: entry.command
    //         }
    //     });
    //
    //     return res.status(200).send(toSend);
    // });

    router.get('/logs', function(req, res){
        LogsDao
            .findAll({
                order: [
                    ['createdAt', 'DESC']
                ]
            })
            .then(function(data){
                res.status(200).send(LogsDao.toJSON(data));
            })
            .catch(res.serverError);
    });
};