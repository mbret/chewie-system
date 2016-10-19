var ip  = require('ip');
var path  = require('path');
var _ = require("lodash");
var utils = require('my-buddy-lib').utils;

export default function(config: any) {
    let defaultConfig =  utils.loadConfig(__dirname + '/default');
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
        apiEndpointAddress: completeConfig.apiEndpointAddress || "https://" + (realIp + ':' + completeConfig.apiPort)
    });
    return completeConfig;
};