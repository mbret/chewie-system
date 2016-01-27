'use strict';

'use strict';

var winston = require('winston');
var util    = require('util');
var chalk   = require('chalk');
var args    = process.argv.slice(2);

function stylize(msg, level){
    switch(level){
        case 'silly':
            return chalk.blue.bold(msg);
        case 'debug':
            return msg;
        case 'verbose':
            return chalk.yellow(msg);
        case 'warn':
            return chalk.yellow.inverse(msg);
        case 'error':
            return chalk.red.inverse(msg);
        case 'info':
            return chalk.bgCyan(msg);
        default:
            return msg;
    }
}

function Logger(config){

    /**
     * Create new instance of logger with specific filter.
     * @param prepend
     * @returns {*}
     */
    this.getLogger = function(prepend){

        var logger = new (winston.Logger)({
            transports: [
                new (winston.transports.Console)({
                    showLevel: false,
                    colorize: false,
                    level: config.log.level,
                    debugStdout: true
                }),
            ],
        });

        logger.addFilter(function(msg, meta, level) {
            msg = '[' + prepend + '] ' + msg;
            return stylize(msg, level);
        });


        return logger;
    };

}

module.exports = Logger;