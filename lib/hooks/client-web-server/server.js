'use strict';
const hook_interface_1 = require("../../core/hook-interface");
const custom_responses_1 = require("./lib/custom-responses");
let http = require('http');
let kraken = require('kraken-js');
let express = require('express');
let app = express();
let https = require('https');
let async = require('async');
let bodyParser = require("body-parser");
let path = require('path');
let fs = require('fs');
let privateKey = null;
let certificate = null;
let server;
module.exports = class ClientWebServer extends hook_interface_1.Hook {
    constructor(system) {
        super(system);
        this.logger = system.logger.Logger.getLogger('ClientWebServer');
    }
    initialize() {
        let self = this;
        let useSSL = self.system.config.webServerSSL.activate;
        app.locals.system = this.system;
        let options = {
            onconfig: function (config, next) {
                next(null, config);
            }
        };
        app.use(kraken(options));
        app.use(custom_responses_1.customResponses);
        if (useSSL) {
            privateKey = fs.readFileSync(self.system.config.webServerSSL.key, 'utf8');
            certificate = fs.readFileSync(self.system.config.webServerSSL.cert, 'utf8');
            server = https.createServer({ key: privateKey, cert: certificate }, app);
        }
        else {
            http.createServer(app).listen();
        }
        server.listen(self.system.config.webServerPort);
        server.on('listening', function () {
            app.locals.url = self.system.config.webServerUrl;
            app.locals.realUrl = self.system.config.webServerRemoteUrl;
            self.logger.debug('Server listening on %s (%s from outside)', app.locals.url, app.locals.realUrl);
        });
        return new Promise(function (resolve, reject) {
            app.on('start', function () {
                self.logger.debug('Application ready to serve requests.');
                self.logger.debug('Environment: %s', app.kraken.get('env:env'));
                return resolve();
            });
        });
    }
}
;
