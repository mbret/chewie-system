"use strict";

let FB = require('fb');

class Module {

    constructor(plugin, info) {
        this.info = info;
        // this.helper = helper;
    }

    newDemand(options, done) {
        console.log("options", options);
        FB.setAccessToken(options.accessToken);
        FB.api('me', function (res) {
            if(!res || res.error) {
                console.log(!res ? 'error occurred' : res.error);
                return done();
            }
            // console.log(res.id);
            // console.log(res.name);
            return done();
        });
    }
}

module.exports = Module;