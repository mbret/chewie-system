'use strict';

/**
 * This module watch for the state of daemon and communicate on it through
 * via the Redis pipe
 */
class Module{

    constructor(daemon, config, scheduler, logger)
    {
        this.daemon = daemon;
        this.scheduler = scheduler;
        this.config = config;
        this.logger = logger;
    }

    initialize()
    {
        var self = this;

        self.logger.debug('Sleep time scheduled from %s to %s', self.config.sleepTime[0], self.config.sleepTime[1]);

        var from = self.config.sleepTime[0];
        var to =  self.config.sleepTime[1];

        this.scheduler.subscribe({
            method: 'range',
            from: [from, 'HH:mm'],
            to: [to, 'HH:mm']

        }, function entered() {
            self.logger.debug('sleep event start');
            self.daemon.emit('sleep');

        }, function left(){
            self.logger.debug('sleep event stop');
            self.daemon.emit('wakeUp')
        });

    }

}

module.exports = Module;