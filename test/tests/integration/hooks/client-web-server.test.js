"use strict";

let system = require("../../bootstrap.test").system;
let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http'); // https://github.com/chaijs/chai-http

chai.use(chaiHttp);

describe('integration.hooks.client-web-server', function() {

    it('should ping the server', function(done){
        chai.request({uri: system.config.webServerUrl, strictSSL: false})
            .get('/ping')
            .end(function(err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            });
    });

});