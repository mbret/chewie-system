"use strict";

let FB = require('fb');

class Module {

    constructor(plugin, info) {
        this.info = info;
        // this.helper = helper;
        this.interval = null;
    }

    newDemand(options, done) {
        this.interval = setInterval(function() {
            console.log("toujours la, toujours la");
        }, 5000);
        // console.log("options", options);
        // FB.setAccessToken(options.accessToken);
        // FB.api('me', function (res) {
        //     if(!res || res.error) {
        //         console.log(!res ? 'error occurred' : res.error);
        //         return done();
        //     }
        //     // console.log(res.id);
        //     // console.log(res.name);
        //     return done();
        // });
    }

    stop() {
        clearInterval(this.interval);
    }
}

module.exports = Module;