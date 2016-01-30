'use strict';

module.exports = function Module(daemon, scheduler, logger, helper){

    class Module{

        constructor(daemon, scheduler, logger){
            var self = this;
            this.daemon = daemon;
            this.scheduler = scheduler;
            this.config = [];
            this.logger = logger;
        }

        initialize(cb)
        {
            var self = this;
            return cb();
        }

        execute(message){
            this.logger.info(message);
        }

        getDefinition(){
            return {
                actionName: 'Ecrire dans la console'
            }
        }
    };

    var voiceAdapter = new Module(daemon, scheduler, logger);

    // Use helper to register adapter
    helper.registerVoiceCommandAdapter(voiceAdapter);

};
Module.require = ['daemon', 'scheduler', 'logger', 'helper'];
