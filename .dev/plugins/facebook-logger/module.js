"use strict";

let FB = require('fb');

class Module {

    constructor(helper, info) {
        this.info = info;
        this.helper = helper;
    }

    run(options, done) {
        console.log("options", options);
        FB.setAccessToken(options.accessToken);
        FB.api('me', function (res) {
            if(!res || res.error) {
                console.log(!res ? 'error occurred' : res.error);
                // return done();
            }
            console.log(res.id);
            console.log(res.name);
            // return done();
        });
    }

    stop() {
        console.log("facebook-logger", "stop");
    }
}

module.exports = Module;