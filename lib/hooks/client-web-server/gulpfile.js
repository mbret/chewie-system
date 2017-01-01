"use strict";

/**
 * https://docs.google.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/pub
 */

let gulp = require('gulp');
const requireAll = require("require-all");

let config = {
    buildPath: __dirname + "/.build",
    env: process.env.NODE_ENV
};

let taskLoadConfig = {
    // simples
    "copy-public": [],
    "build-less": [],
    "watch-less": [],
    "watch-public": [],
    "inject-js": ["copy-public", "build-less"],
    // primaries
    "build": ["inject-js"],
    "watch": ["watch-less", "watch-public"]
};

// load tasks
requireAll({
    dirname: __dirname + "/tasks",
    recursive: true,
    resolve: function (task) {
        let taskToLoad = task(gulp, config);
        if (taskLoadConfig[taskToLoad.name] !== undefined) {
            return gulp.task(taskToLoad.name, taskLoadConfig[taskToLoad.name], taskToLoad.fn);
        }
    },
});