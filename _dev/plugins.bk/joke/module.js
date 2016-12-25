'use strict';

var request = require('request');
var Entities = require('html-entities').AllHtmlEntities;

class Module {

    constructor(helper) {
        this.helper = helper;
    }

    initialize(cb){
        var self = this;

        // Listen for new task on module
        // this.helper.onNewTask(function(context){
        //
        //     this._getChuckNorrisFact(function(err, fact){
        //         self.helper.executeMessage(context, fact);
        //     });
        //
        // });

        return cb();
    }

    getConfig(){
        return {
            outputSupport: true
        };
    }

    _getChuckNorrisFact(cb)
    {
        var entities = new Entities();
        var self = this;
        request('http://www.chucknorrisfacts.fr/api/get?data=nb:1;tri:alea', function (error, response, body) {
            if(error){
                return cb(error);
            }
            if (!error && response.statusCode == 200) {
                var fact = JSON.parse(body);
                fact = fact[0].fact;
                fact = entities.decode(fact);
                fact = fact.replace('Chuck Norris', 'Chuck Norrisse').replace('chuck Norris', 'chuck Norrisse');;
                return cb(null, fact);
            }
        });
    }
}

module.exports = Module;