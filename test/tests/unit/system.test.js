"use strict";

// https://github.com/thlorenz/proxyquire
// https://github.com/jhnns/rewire

let chai = require('chai');
let assert = chai.assert;
let System = require("../../../.dist/system").System;

describe('unit.system', function() {

    let system = null;
    before(function(done) {
        done();
    });

    describe('unit.system.construct', function() {

        it('should create a valid system', function(){
            system = new System({
                id: "foo",
                name: "test"
            });
        });

    });

    describe('unit.system.start', function() {

        it('should be ok', function(done){
            system.start({
                settings: {
                    hooks: {
                        "client-web-server": false,
                        "shared-server-api": {
                            modulePath: __dirname + "/../mocks/shared-server-api"
                        },
                        "scenarios": false,
                        "plugins": false
                    }
                }
            }, done);
        });

    });

    describe('unit.system.restart', function() {

        it('should be ok', function(){

        });

    });

    describe('unit.system.shutdown', function() {

        it('should shutdown', function(done){
            let realExit = process.exit;
            process.exit = function(code) {
                assert.strictEqual(code, 0);
                process.exit = realExit;
                system = null;
                done();
            };

            system.shutdown();
        });

    });

    describe('unit.system.shutdown', function() {

        it('should shutdown', function(done){

        });

    });

});