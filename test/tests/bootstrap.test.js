'use strict';

process.env.APP_ROOT_PATH = __dirname + '/../_test';

var utils = require('my-buddy-lib').utils;
var System = require(__dirname + '/../../index.js');
var instance;

before(function(done) {
    System.start(utils.loadConfig(process.env.APP_ROOT_PATH + '/config'), function(err, system){
        instance = system;
        done();
    });
});

after(function(done) {
    instance.shutdown(function(){
        done();
    });
});