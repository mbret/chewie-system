"use strict";

import _ = require("lodash");
import ip  = require('ip');
import path = require("path");

/**
 * @param config
 * @returns {object}
 */
export default function(config: any) {
    let defaultConfig =  require("./default");
    let completeConfig = _.merge({}, defaultConfig, config);
    let realIp = ip.address();
    let appPath = process.cwd();

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
};