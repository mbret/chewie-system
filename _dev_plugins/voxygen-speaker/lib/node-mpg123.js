/**
 * node-mpg123
 * Javascript mpg123 wrapper for Node.js
 *
 * @author Maciej Sopy?o (killah)
 * Copyright 2012 Maciej Sopy?o @ KILLAHFORGE.
 *
 * MIT License
 */

var	spawn = require('child_process').spawn,
    events = require('events'),
    util = require('util');
var path = require('path');

var executable = "mpg123";

module.exports = function Sound(filename, exePath) {
    events.EventEmitter.call(this);
    this.filename = path.resolve(filename);

    if(exePath){
        executable = exePath;
    }
};

util.inherits(module.exports, events.EventEmitter);

/**
 *
 */
module.exports.prototype.play = function () {
    this.stopped = false;
    this.process = spawn(executable, [ this.filename ]);
    var self = this;

    this.process.stderr.on('data', function(err){
        console.error('Error while running mpg123: ' + err);
    });

    this.process.on('close', function(code) {

    });

    this.process.on('exit', function (code, sig) {
        if (code !== null && sig === null) {
            self.emit('complete');
        }
    });
};

module.exports.prototype.stop = function () {
    this.stopped = true;
    this.process.kill('SIGTERM');
    this.emit('stop');
};

module.exports.prototype.pause = function () {
    if (this.stopped) return;
    this.process.kill('SIGSTOP');
    this.emit('pause');
};

module.exports.prototype.resume = function () {
    if (this.stopped) return this.play();
    this.process.kill('SIGCONT');
    this.emit('resume');
};