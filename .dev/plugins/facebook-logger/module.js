"use strict";

let FB = require('fb');

class Module {

    constructor(helper, info) {
        this.info = info;
        this.helper = helper;
    }

    run(options, done) {
        FB.setAccessToken(options.accessToken);
        FB.api('me', function (res) {
            if(!res || res.error) {
                console.log(!res ? 'error occurred' : res.error);
                return done();
            }
            console.log(res.id);
            console.log(res.name);
            return done();
        });
    }

    stop() {

    }
}

module.exports = Module;