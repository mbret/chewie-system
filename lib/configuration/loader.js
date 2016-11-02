"use strict";
var ip = require('ip');
var path = require('path');
var _ = require("lodash");
var utils = require('my-buddy-lib').utils;
/**
 * @param config
 * @returns {object}
 */
function default_1(config) {
    var defaultConfig = utils.loadConfig(__dirname + '/default');
    var completeConfig = _.merge({}, defaultConfig, config);
    var realIp = ip.address();
    var appPath = process.cwd();
    // Set some config only possible during runtime
    _.merge(completeConfig, {
        appPath: appPath,
        system: {
            pluginsTmpDir: completeConfig.system.pluginsTmpDir || path.join(completeConfig.system.tmpDir, 'plugins'),
            pluginsDataDir: completeConfig.system.pluginsDataDir || path.join(completeConfig.system.dataDir, 'plugins'),
            synchronizedPluginsDir: completeConfig.system.synchronizedPluginsDir || path.join(completeConfig.system.dataDir, 'synchronized-plugins'),
        },
        realIp: realIp,
        apiEndpointAddress: completeConfig.apiEndpointAddress || ((completeConfig.sharedServerApiSSL.activate ? "https" : "http") + "://" + (realIp + ':' + completeConfig.apiPort))
    });
    return completeConfig;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
;
