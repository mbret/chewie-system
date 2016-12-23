'use strict';

let _ = require("lodash");

module.exports = function (router) {

    router.get('/', function (req, res) {
        
        return res.sendFile('index.html', {
            root: __dirname + "/../public"
        });
    });

    /**
     * Return the configuration as json for app
     */
    router.get('/configuration.js', function(req, res){

        // use req.ip !== '::1' && req.ip !== '::ffff:127.0.0.1' to detect local vs remote

        let config = {
            apiUrl: req.app.locals.url,
            sharedApiUrl:  req.app.locals.system.config.sharedApiUrl,
            pluginsLocalDir: req.app.locals.system.config.pluginsLocalRepositoryDir,
            pluginsInstallationDir: req.app.locals.system.config.system.synchronizedPluginsDir,
            systemInfo: _.merge(req.app.locals.system.info, {
                uptime: process.uptime()
            }),
            systemId: req.app.locals.system.id
        };

        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', 0);
        res.send('window.SERVER_CONFIG = ' + JSON.stringify(config) + ';');
    });
};
