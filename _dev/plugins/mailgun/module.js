"use strict";

const mailgun = require('mailgun.js');

class Module {

    constructor(helper, info) {
        this.info = info;
        this.helper = helper;
    }

    run(options) {
        var mg = mailgun.client({username: 'api', key: options.privateKey});
        mg.messages
            .create('sandbox1fcaa390e97a424e9fd9abb4121edcca.mailgun.org', {
                from: "chewie@chewie.home",
                to: ["xmax54@gmail.com"],
                subject: "Chewie",
                html: options.content
            })
            .then(msg => console.log("ok", msg))
            .catch(err => console.log("err", err));
    }
}

module.exports = Module;