"use strict";
const _ = require("lodash");
const ip = require("ip");
const path = require("path");
const publicIp = require('public-ip');
function default_1(config) {
    let defaultConfig = require("./default");
    let completeConfig = _.merge({}, defaultConfig, config);
    let systemIP = ip.address();
    let appPath = process.cwd();
    let webServerUrl = ((completeConfig.webServerSSL.activate ? "https" : "http") + "://localhost:" + completeConfig.webServerPort);
    let dataPath = path.join(completeConfig.system.appDataChewiePath, completeConfig.system.dataDir);
    _.merge(completeConfig, {
        appPath: appPath,
        systemIP: systemIP,
        dataPath: dataPath,
        webServerUrl: webServerUrl,
        webServerRemoteUrl: webServerUrl.replace("localhost", systemIP),
        synchronizedPluginsPath: path.join(dataPath, completeConfig.system.synchronizedPluginsDir)
    });
    return formatDynConfig(completeConfig);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
;
function formatDynConfig(config) {
    let promises = [];
    _.forEach(config, function (entry, key) {
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
        .then(function () {
        return config;
    });
}
//# sourceMappingURL=loader.js.map