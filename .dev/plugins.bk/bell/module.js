'use strict';

var _ = require('lodash');
var http = require('http');

class Module {

    constructor(helper){
        this.helper = helper;
    }

    initialize(cb){



        return cb();
    }

    destroy(cb) {
        return cb();
    }

    newTask(task) {
        var self = this;

        task.on('execute', function(context) {

            //Create a server
            var server = http.createServer(handleRequest);

            // initialize the server
            var port = context.options.port;
            server.listen(port, function(err) {
                if (err) {
                    self.logger.error(err);
                    return;
                }

                self.logger.debug("server listening on ${port}");
            });

            function handleRequest(request, response) {
                console.log("coucou");
            }
        });

        task.on('stopped', function() {

        });
    }

    /**
     * This module is simple and only say a message.
     */
    _say(context){
        var self = this;
        if(!_.isString(context.getOptions().text)){
            self.helper.notify('warn', 'Invalid task options received [' + JSON.stringify(context.options) + ']');
        }
        else{
            var text = context.getOptions().text;
            // handle what user want (mail, voice, etc)
            this.helper.executeMessage(context, text);
        }
    }

}

module.exports = Module;