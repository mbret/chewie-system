'use strict';

var _ = require('lodash');
//var phantom = require('phantom');
var request = require('request');
var Entities = require('html-entities').AllHtmlEntities;
var config = require('./config.js');

module.exports = function(ParentModule, daemon, userConfig, scheduler, logger){

    class Module extends ParentModule{

        constructor(daemon, userConfig, scheduler, logger) {
            super();
            this.deamon = daemon;
            this.logger = logger;
            this.scheduler = scheduler;
            this.config = _.merge(config, userConfig);
        }

        start(){

            var self = this;

            _.forEach(this.config.say, function(say){
                self._registerSay(say);
            });

        }

        _registerSay(say)
        {
            if(say.type === "chuck"){
                return this._registerSayChuck(say.schedule);
            }
        }

        _registerSayChuck(schedule)
        {
            var self = this;
            this._watchForChance(schedule.interval, function(){
                self._getChuckNorrisFact(function(err, fact){
                    self.emit('play', fact);
                });
            });
        }

        /**
         *
         */
        _watchForChance(interval, cb){
            var self = this;
            var minSecond = interval[0] * 1000;
            var maxSecond = interval[1] * 1000;
            (function loop() {
                var nextIn = (minSecond + (Math.random() * maxSecond));
                var rand = nextIn;
                setTimeout(function() {
                    cb();
                    loop();
                }, rand);
            }());
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

    return new Module(daemon, userConfig, scheduler, logger);
};
