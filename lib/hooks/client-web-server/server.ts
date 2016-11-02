'use strict';
import {Daemon} from "../../daemon";
import {Hook} from "../../core/hook";
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
let self = null;

export class ClientWebServer implements Hook {

    system: Daemon;
    logger: any;

    constructor(system: Daemon) {
        self = this;
        this.system = system;
        this.logger = system.logger.Logger.getLogger('ClientWebServer');
    }

    initialize(done: Function) {

        app.locals.system = this.system;

        /*
         * Create and configure application. Also exports application instance for use by tests.
         * See https://github.com/krakenjs/kraken-js#options for additional configuration options.
         */
        let options = {
            onconfig: function (config, next) {
                /*
                 * Add any additional config setup or overrides here. `config` is an initialized
                 * `confit` (https://github.com/krakenjs/confit/) configuration object.
                 */
                next(null, config);
            }
        };

        // Prepare app
        app.use(kraken(options));

        // use ssl ?
        if (self.system.config.webServerSSL.activate) {
            privateKey = fs.readFileSync(self.system.config.webServerSSL.key, 'utf8');
            certificate = fs.readFileSync(self.system.config.webServerSSL.cert, 'utf8');
            server = https.createServer({key: privateKey, cert: certificate}, app);
        } else {
            server = http.createServer(app);
        }

        server.listen(self.system.config.webServerPort);
        server.on('listening', function () {
            self.logger.debug('Server listening on http://localhost:%d', this.address().port);
        });

        app.on('start', function () {
            self.logger.debug('Application ready to serve requests.');
            self.logger.debug('Environment: %s', app.kraken.get('env:env'));
            return done();
        });
    }
}
