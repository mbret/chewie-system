// 'use strict';
//
// var _ = require('lodash');
// var AbstractContainer = require('./../abstract-container.js');
// var uuid = require('uuid');
//
// class TriggerContainer extends AbstractContainer{
//
//     constructor(pluginId, id, instance, userOptions){
//         super(MyBuddy, pluginId, userOptions, instance);
//
//         this.logger = MyBuddy.logger.Logger.getLogger('taskTriggerContainer');
//
//         this.id = id;
//         this.instance = instance;
//     }
//
//     /**
//      * The task trigger contain module option but also
//      * task options. These options are used when creating a task.
//      */
//     getConfig(){
//         return _.merge({
//             // options relative to the trigger run context
//             triggerOptions: []
//         }, super.getConfig());
//     }
//
//     getId(){
//         return this.id;
//     }
//
//     static checkModuleValidity(module, moduleName){
//         if(typeof module !== 'function'){
//             this.logger.error('The module [' + moduleName + '] is not a function');
//             return false;
//         }
//         if(
//             !(module.prototype.initialize instanceof Function)
//             || !(module.prototype.getConfig instanceof Function)
//         ){
//             this.logger.error('The module [' + moduleName + '] does not have minimal required methods!');
//             return false;
//         }
//
//         return true;
//     }
//
//     watch(options, cb){
//         var id = uuid.v4();
//
//         // Emit watch event with id so the module can start to watch for these options
//         // then emit an execute event with the same id.
//         this.emit('trigger:watch', id, options);
//
//         // Listen for execute event emitted on the object
//         // We should get an id relative to the watch, so we only
//         // trigger the correct cb.
//         this.on('trigger:execute:' + id, function(){
//             return cb();
//         })
//     }
// }
//
// module.exports = TriggerContainer;