'use strict';
const winston = require('winston');
const util = require('util');
const chalk = require('chalk');
const _ = require('lodash');
const pad = require('pad');
const emoji = require('node-emoji');
const path = require("path");
const PROJECT_ROOT = path.join(__dirname, '../..');
class LoggerBuilder {
    constructor(config) {
        config = config || {};
        config = _.merge({
            level: "debug",
        }, config);
        this.loggers = [];
        this.transports = [new (winston.transports.Console)({
                showLevel: false,
                colorize: false,
                level: config.level,
                debugStdout: true,
            })];
    }
    getLogger(prepend) {
        let self = this;
        let logger = new (winston.Logger)({
            transports: self.transports,
            filters: [
                function (level, msg, meta) {
                    return self.stylize(prepend, msg, level);
                }
            ]
        });
        logger.getLogger = self.getLogger.bind(self);
        logger.emoji = emoji;
        let debug = logger.debug;
        logger.debug = function () {
            debug.apply(logger, formatLogArguments(arguments));
        };
        let verbose = logger.verbose;
        logger.verbose = function () {
            verbose.apply(logger, formatLogArguments(arguments));
        };
        this.loggers.push(logger);
        return logger;
    }
    ;
    stylize(prepend, msg, level) {
        prepend = pad("❤ " + prepend, 25) + ' ';
        let rx = /{:stack(.*)\/:stack}/g;
        let stack = rx.exec(msg);
        if (stack) {
            msg = msg.replace(rx, chalk.gray(stack[1]));
        }
        switch (level) {
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
exports.LoggerBuilder = LoggerBuilder;
function formatLogArguments(args) {
    args = Array.prototype.slice.call(args);
    let stackInfo = getStackInfo(1);
    if (stackInfo) {
        let calleeStr = '(' + stackInfo.relativePath + ':' + stackInfo.line + ')';
        if (typeof (args[0]) === 'string') {
            args[0] = args[0] + " {:stack" + calleeStr + "/:stack}";
        }
        else {
            args.unshift(calleeStr);
        }
    }
    return args;
}
function getStackInfo(stackIndex) {
    let stacklist = (new Error()).stack.split('\n').slice(3);
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
        };
    }
}
//# sourceMappingURL=logger.js.map