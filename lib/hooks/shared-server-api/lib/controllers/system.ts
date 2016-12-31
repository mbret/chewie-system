'use strict';

import * as _ from "lodash";
const validator = require('validator');
const path = require('path');

module.exports = function(server, router){

    let UserDao = server.orm.models.User;
    let LogsDao = server.orm.models.Logs;
    let self = server;

    router.get('/ping', function (req, res) {
        res.send('pong you moron!');
    });

    /**
     * Make the system speak the given text.
     */
    router.post('/speak', function(req, res){
        let text = req.body.text;

        server.system.speaker.play(text);

        return res.sendStatus(200);
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
    //     let command = req.body.command;
    //
    //     MyBuddy.speechHandler.executeCommand(command);
    //
    //     return res.sendStatus(201);
    // });

    // router.get('/speech/commands', function(req, res){
    //     let tmp = MyBuddy.speechHandler.getCommands();
    //
    //     let toSend = tmp.map(function(entry){
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