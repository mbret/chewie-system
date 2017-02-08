'use strict';

const winston = require('winston');
const util = require('util');
const chalk = require('chalk');
const _ = require('lodash');
const pad = require('pad');
const emoji = require('node-emoji');
const path = require("path");
const PROJECT_ROOT = path.join(__dirname, '../..');

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

        // monkey patch to get stack
        // let debug = logger.debug;
        // logger.debug = function() {
        //     debug.apply(logger, formatLogArguments(arguments));
        // };
        // let verbose = logger.verbose;
        // logger.verbose = function() {
        //     verbose.apply(logger, formatLogArguments(arguments));
        // };

        this.loggers.push(logger);

        return logger;
    };

    // https://raw.githubusercontent.com/omnidan/node-emoji/master/lib/emoji.json
    private stylize(prepend, msg, level) {
        // prepend = '[' + prepend + ']';
        // prepend = pad(level + " " + prepend, 20) + ' ';
        prepend = pad("❤ " + prepend, 25) + ' ';
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

function formatLogArguments (args) {
    args = Array.prototype.slice.call(args);

    let stackInfo = getStackInfo(1);

    if (stackInfo) {
        // get file path relative to project root
        let calleeStr = '(' + stackInfo.relativePath + ':' + stackInfo.line + ')';

        if (typeof (args[0]) === 'string') {
            // args[0] = calleeStr + ' ' + args[0];
            args[0] = args[0] + " {:stack" + calleeStr + "/:stack}";
        } else {
            args.unshift(calleeStr)
        }
    }

    return args
}

/**
 * @todo this method has heavy impact on performance but for now there are no other way to capture trace.
 * @param stackIndex
 * @returns {{method: string, relativePath: string, line: string, pos: string, file: string, stack: string}}
 */
function getStackInfo (stackIndex) {
    // get call stack, and analyze it
    // get all file, method, and line numbers
    let stacklist = (new Error()).stack.split('\n').slice(3);

    // stack trace format:
    // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
    // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
    let stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;
    let stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi;

    let s = stacklist[stackIndex] || stacklist[0];
    let sp = stackReg.exec(s) || stackReg2.exec(s);

    if (sp && sp.length === 5) {
        return {
            method: sp[1],
            relativePath: path.relative(PROJECT_ROOT, sp[2]),
            line: sp[3],
            pos: sp[4],
            file: path.basename(sp[2]),
            stack: stacklist.join('\n')
        }
    }
}