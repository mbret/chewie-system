"use strict";

import _ = require("lodash");
import ip  = require('ip');
import path = require("path");
const publicIp = require('public-ip');

/**
 * Return the default config with some value calculated during runtime.
 * @param config
 * @returns {object}
 */
export default function(config: any) {
    let defaultConfig =  require("./default");
    let completeConfig = _.merge({}, defaultConfig, config);
    let systemIP = ip.address();
    let appPath = process.cwd();
    let webServerUrl = ((completeConfig.webServerSSL.activate ? "https" : "http") + "://localhost:" + completeConfig.webServerPort);
    let dataPath = path.join(completeConfig.systemAppDataPath, "data");

    // Set some config only possible during runtime
    _.merge(completeConfig, {
        appPath: appPath,
        systemIP: systemIP,
        dataPath: dataPath,
        // sharedApiUrl: completeConfig.sharedApiUrl || ((completeConfig.sharedApiSSL.activate ? "https" : "http") + "://" + (systemIP + ':' + completeConfig.sharedApiPort)),
        webServerUrl: webServerUrl,
        webServerRemoteUrl: webServerUrl.replace("localhost", systemIP),
        synchronizedPluginsPath: path.join(dataPath, completeConfig.system.synchronizedPluginsDir)
    });

    return formatDynConfig(completeConfig);
};

function formatDynConfig(config) {
    let promises = [];
    _.forEach(config, function(entry: any, key: any) {
        // external ip
        if (typeof entry === "string") {
            if (entry.search("{:publicIp}") >= 0) {
                console.log("public ip detected");
                promises.push(publicIp.v4().then(ip => {
                    config[key] = config[key].replace("{:publicIp}", ip);
                }));
            }
        }
    });
    return Promise.all(promises)
        .then(function() {
            return config;
        });
}