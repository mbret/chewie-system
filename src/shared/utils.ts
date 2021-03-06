let fs = require('fs');
let path = require('path');
let async = require('async');

/**
 * @link https://github.com/alessioalex/get-folder-size
 * @version 1.0.0
 * @param item
 * @param ignoreRegEx
 * @param callback
 */
export function getFolderSize(item, ignoreRegEx, callback) {
    let cb;
    let ignoreRegExp;

    if (!callback) {
        cb = ignoreRegEx;
        ignoreRegExp = null;
    } else {
        cb = callback;
        ignoreRegExp = ignoreRegEx;
    }

    fs.lstat(item, function lstat(e, stats) {
        let total = !e ? (stats.size || 0) : 0;

        if (!e && stats.isDirectory()) {
            fs.readdir(item, function readdir(err, list) {
                if (err) { return cb(err); }

                async.forEach(
                    list,
                    function iterate(dirItem, next) {
                        getFolderSize(
                            path.join(item, dirItem),
                            ignoreRegExp,
                            function readSize(error, size) {
                                if (!error) { total += size; }

                                next(error);
                            }
                        );
                    },
                    function done(finalErr) {
                        cb(finalErr, total);
                    }
                );
            });
        } else {
            if (ignoreRegExp && ignoreRegExp.test(item)) {
                total = 0;
            }

            cb(e, total);
        }
    });
}