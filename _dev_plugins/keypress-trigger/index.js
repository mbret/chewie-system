"use strict";

module.exports = function(name, helper){
    helper.registerTaskTrigger(require('./trigger'));
};