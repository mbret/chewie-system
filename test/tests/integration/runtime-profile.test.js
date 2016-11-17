"use strict";

let system = require("../bootstrap.test").system;
let chai = require('chai');
let expect = chai.expect;
var assert = chai.assert;

describe('integration.runtime-profile', function() {

    afterEach(function(done) {
        done();
    });

    it('should have profile manager', function(){
        expect(system.runtime.profileManager).to.be.an("object");
    });

    it('should start the profile admin', function(done){
        system.runtime.profileManager.startProfile("admin")
            .then(function() {
                expect(system.runtime.profileManager.profile).to.be.an("object");
                done();
            })
            .catch(done);
    });

    it("should start and stop the profile admin", function(done) {
        system.runtime.profileManager.stopProfile()
            .then(function() {
                expect(system.runtime.profileManager.profile).to.be.null;
            }).then(done, done);
    });

    it('should fail start the profile foo', function(done){
        system.runtime.profileManager.startProfile("foo")
            .then( () => { throw new Error("Not supposed to succeed"); })
            .catch(function(err) {
                expect(err).to.be.an("object");
                expect(err.code).to.equal("bError.1");
                done();
            });
    });
});