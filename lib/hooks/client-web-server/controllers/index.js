'use strict';

let _ = require("lodash");
let path = require("path");

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

        let config = {
            apiUrl: req.app.locals.url,
            pluginsLocalRepositoryDir: path.resolve(req.app.locals.system.config.pluginsLocalRepositoryDir),
            pluginsInstallationDir: path.resolve(req.app.locals.system.config.system.synchronizedPluginsDir),
            pluginsDataDir: path.resolve(req.app.locals.system.config.system.pluginsDataDir),
            pluginsTmpDir: path.resolve(req.app.locals.system.config.system.pluginsTmpDir),
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
