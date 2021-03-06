"use strict";

import _ = require("lodash");
import ip  = require('ip');
import path = require("path");
import * as os from "os";
import * as fs from "fs";
import jsonfile = require('jsonfile');

/**
 * Return the default config with some value calculated during runtime.
 * @returns {object}
 */
export function loadConfig() {
    let systemIP = ip.address();
    let appPath = process.cwd();
    let basePath =  __dirname + "/../..";

    return loadConfigFiles(__dirname + "/../config")
        .then((defaultConfig) => loadUserConfig(appPath, defaultConfig))
        .then(function(completeConfig: any) {
            let localAppDataDir = os.platform() === 'win32' ? process.env.LOCALAPPDATA : os.homedir();
            let dataPath = path.join(completeConfig.systemAppDataPath, "data");
            let replaceTo = {
                "env": process.env.NODE_ENV || "development",
                "localAppDataDir": localAppDataDir,
                "osTmpDir": os.tmpdir(),
                basePath,
                "resourceDir": basePath + "/resources",
                appPath,
                systemIP,
                dataPath,
                // webServerUrl
            };

            // Set some config only possible during runtime
            completeConfig = _.merge({}, completeConfig, {
                // sharedApiUrl: completeConfig.sharedApiUrl || ((completeConfig.sharedApiSSL.activate ? "https" : "http") + "://" + (systemIP + ':' + completeConfig.sharedApiPort)),
                synchronizedPluginsPath: path.join(dataPath, completeConfig.system.synchronizedPluginsDir)
            });

            let replacedConfig = formatDynConfig(replaceTo, completeConfig);

            return Promise.resolve(_.merge(completeConfig, replacedConfig));
        });
}

/**
 * Will loop over all config key (recursively) and replace
 * $chewie{something} into the corresponding mapping value.
 * For example if replaceTo contain "foo" with value "bar". The result of
 * {
 *  "myConfig": "blabla ... $chewie{foo} ..."
 * }
 * will result to:
 * {
 *  "myConfig": "blabla ... bar ..."
 * }
 * If foo does not exist in replaceTo mapping, then the template is unchanged.
 */
function formatDynConfig(replaceTo, config) {
    let replaced = {};
    // let promises = [];
    // loop for every string entry
    _.forEach(config, function(entry: any, key: any) {
        if (typeof entry === "string") {
            // export replaceable values
            let entryBeingReplaced = entry;
            let regex = new RegExp(`\\$chewie\\{(.*?)\\}`, "g");
            let match = regex.exec(entry);
            while (match !== null) {
                let keyFound = match[1];
                if (replaceTo.hasOwnProperty(keyFound)) {
                    entryBeingReplaced = entryBeingReplaced.replace(new RegExp(`\\$chewie\\{${_.escapeRegExp(keyFound)}\\}`, "g"), replaceTo[keyFound]);
                    // go for possible next occurrence
                    match = regex.exec(entry);
                }
            }
            replaced[key] = entryBeingReplaced;
        } else if (typeof entry === "object") {
            replaced[key] = formatDynConfig(replaceTo, entry);
        }
    });

    return replaced;
}

/**
 *
 * @param dir
 * @returns {Promise<{}>}
 */
function loadConfigFiles(dir) {
    return new Promise(function(resolve, reject) {
        // Loop through all the files in the temp directory
        fs.readdir(dir, function(err, files) {
            if(err) {
                return reject(err);
            }

            files = files.filter(file => path.extname(file) === ".js" || path.extname(file) === ".json");
            let config = {};
            let promises = [];
            files.forEach(function(file) {
                // Make one pass and make the file complete
                let filePath = path.join( dir, file );

                promises.push(new Promise((resolve, reject) => {
                    fs.stat(filePath, function(error, stat) {
                        if (error) {
                            return reject(error);
                        }

                        if (stat.isFile()) {
                            config = _.merge({}, config, require(filePath));
                        }
                        return resolve();
                    })
                }));
            } );

            return Promise.all(promises)
                .then(() => resolve(config))
                .catch(reject);
        } );
    });
}

function loadUserConfig(appPath: string, defaultConfig: any) {
    let userConf;
    try {
        userConf = jsonfile.readFileSync(`${path.join(appPath, '.user.conf.json')}`);
    } catch (err) {
        if (err.code === "ENOENT") {
            return Promise.resolve(defaultConfig);
        }
        return Promise.reject(new Error("Unable to read .user.conf.json. Please check that the file is in valid json format. Err:\n" + err.message));
    }

    return Promise.resolve(_.merge({}, defaultConfig, userConf));
}