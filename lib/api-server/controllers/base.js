'use strict';

var _ = require('lodash');

module.exports = function(server, router){

    var self = server;

    /**
     * Helper to check state of daemon
     */
    router.get('/ping', function (req, res) {
        res.send('pong');
    });

    router.post('/speak', function(req, res){
        var text = req.body.text;

        MyBuddy.speak.play(text);
        res.sendStatus(200);
    });

    /**
     * Expose route to shutdown daemon.
     */
    router.get('/shutdown', function(req, res){
        res.sendStatus(200);
        self.daemon.shutdown();
    });

    router.get('/restart', function(req, res){
        setTimeout(function(){ self.daemon.restart() }, 1);
        return res.sendStatus(200);
    });

    router.get('/system', function(req, res){

        return res.status(200).send({
            startedAt: MyBuddy.info.startedAt
        });
    });

    router.post('/speech/commands', function(req, res){

        console.log('xdf', req.body);
        var command = req.body.command;

        MyBuddy.speechHandler.executeCommand(command);

        return res.sendStatus(201);
    });

    router.get('/speech/commands', function(req, res){
        var tmp = MyBuddy.speechHandler.getCommands();

        var toSend = tmp.map(function(entry){
           return {
               command: entry.command
           }
        });

        return res.status(200).send(toSend);
    });

    return router;
};