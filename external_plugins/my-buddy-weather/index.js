'use strict';

var _           = require('lodash');
var Forecast    = require('forecast');
var moment      = require('moment');
var config      = require('./config.js');
var i18n        = require("i18n");

module.exports = function(ParentModule, daemon, userConfig, scheduler, logger){

    class Module extends ParentModule{

        /**
         *
         * @param daemon
         * @param userConfig
         */
        constructor(daemon, userConfig, scheduler, logger) {
            super();
            this.deamon = daemon;
            this.config = _.merge(config, userConfig);
            this.scheduler = scheduler;
            this.logger = logger;

            this.forecast = new Forecast({
                service: 'forecast.io',
                key: this.config.forecastKey,
                units: 'celcius', // Only the first letter is parsed
                cache: true,      // Cache API requests?
                ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/
                    minutes: 27,
                    seconds: 45
                }
            });

            i18n.configure({
                locales:['fr', 'en'],
                directory: __dirname + '/locales',
                defaultLocale: 'fr',
                updateFiles: true
            });
        }

        start(){
            var self = this;

            // Loop for each say config specified
            if(Array.isArray(this.config.tasks)){
                _.forEach(this.config.tasks, function(say){
                    self._registerSay(say);
                });
            }
        }

        _registerSay(say){

            var self = this;

            this.scheduler.subscribe(say.schedule, function(){
                self._say(say, function(err){
                    if(err){
                        self.logger.error(err);
                    }
                });
            });
        }

        /**
         * Say the weather
         */
        _say(say, cb){
            var self = this;
            self._retrieveWeather(say.latitude, say.longitude, function(err, weather){
                if(err){
                    return cb(err);
                }
                var temp = weather.currently.temperature.toString(); // ex 7.23
                var sentence = self.config.defaultSentence;
                if(say.sentence){
                    sentence = say.sentence;
                }
                sentence = sentence
                    .replace('[city]', say.city)
                    .replace('[summary]', i18n.__(weather.currently.summary))
                    .replace('[degree]', temp.split(".")[0]);
                self.emit('play', sentence);
                return cb();
            });
        }

        _retrieveWeather(lat, lon, cb){
            // Retrieve weather information from coordinates (Sydney, Australia)
            this.forecast.get([lat, lon], function(err, weather) {
                return cb(err, weather);
            });
        }

    }

    return new Module(daemon, userConfig, scheduler, logger);
};
