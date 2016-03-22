'use strict';
var Repository = require('./base');
var requireAll = require('require-all');

class LocalRepository extends Repository{

    constructor(system){
        super(system);
    }

    loadPlugin(name){
        return new Promise(function(resolve, reject){

        });
    }
}

module.exports = LocalRepository;