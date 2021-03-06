'use strict';

const winston = require('winston');
const util = require('util');
const chalk = require('chalk');
const _ = require('lodash');
const emoji = require('node-emoji');
const path = require("path");

export interface LoggerInterface {
    info(content: string);
    verbose(...args: any[]);
    debug(content: string);
    error(...args: any[]);
    warn(content: string);
    getLogger(prepend: string): LoggerInterface;
    emoji: any;
}

export class LoggerBuilder {

    transports: any;
    loggers: any;

    constructor(config: any) {
        config = config || {};
        config = _.merge({
            level: "debug",
        }, config);
        this.loggers = [];

        // default transporter (console)
        this.transports = [new (winston.transports.Console)({
            showLevel: false,
            colorize: false,
            level: config.level,
            debugStdout: true,
        })];
    }

    // public addTransportForAllLoggers(transport){
    //     this.transports.push(transport);
    //     this.loggers.forEach(function(logger){
    //         logger.add(transport, null, true);
    //     });
    // };

    /**
     * Create new instance of logger with specific filter.
     * @param prepend
     * @returns {*}
     */
    public getLogger(prepend): LoggerInterface {
        let self = this;
        let logger = new (winston.Logger)({
            transports: self.transports,
            filters: [
                function(level, msg, meta) {
                    return self.stylize(prepend, msg, level);
                }
            ]
        });
        logger.getLogger = self.getLogger.bind(self);
        logger.emoji = emoji;

        this.loggers.push(logger);

        return logger;
    };

    // https://raw.githubusercontent.com/omnidan/node-emoji/master/lib/emoji.json
    private stylize(prepend, msg, level) {
        prepend = _.padEnd("❤ " + prepend, 25) + ' ';
        let rx = /{:stack(.*)\/:stack}/g;
        let stack = rx.exec(msg);
        if (stack) {
            msg = msg.replace(rx, chalk.gray(stack[1]));
        }
        switch(level) {
            case 'silly':
                return chalk.magenta(prepend) + ' ' + chalk.gray(msg);
            case 'debug':
                return chalk.magenta(prepend) + ' ' + chalk.white(msg);
            case 'verbose':
                return chalk.magenta(prepend) + ' ' + chalk.gray(msg);
            case 'warn':
                return chalk.magenta(prepend) + ' ' + chalk.yellow("¯\\_(ツ)_/¯ " + msg);
            case 'error':
                return chalk.magenta(prepend) + ' ' + chalk.red(msg);
            case 'info':
                return chalk.magenta(prepend) + ' ' + chalk.blue(msg);
            default:
                return msg;
        }
    }
}