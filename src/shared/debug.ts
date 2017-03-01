let d = require('debug');
let path = require("path");
const PROJECT_ROOT = __dirname + "/../..";

// debug creator
export function debug(namespace: string = null): any {
    namespace = namespace ? ":" + namespace : "";
    let debugCreator = d("chewie" + namespace);
    return function(...args) {
        debugCreator.apply(null, formatLogArguments(arguments));
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
            args[0] = args[0] + " " + calleeStr + "";
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