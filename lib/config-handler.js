'use strict';

var _ = require('lodash');

/**
 *
 */
function configHandler(){

}

configHandler.prototype.loadConfig = function(path, root){
    var config = require(path + '/config.js');
    var localConfig = {};
    try{
        localConfig = require(path + '/config.local.js');
    }
    catch(e){
        if(e.code === "MODULE_NOT_FOUND"){
            // ...
        }
        else{
            throw e;
        }
    }
    return this.initConfig(config, localConfig, root);
};

configHandler.prototype.initConfig = function(userConfig, localConfig, root){

    var tmp = _.merge(userConfig, localConfig, {
        appPath: root,
    });
    return tmp;
};

/**
 * Save configuration to db.
 * @param config
 */
configHandler.prototype.saveConfig = function(config){

};

module.exports = new configHandler();