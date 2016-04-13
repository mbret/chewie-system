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

    var stderr = '';
    var stdout = '';

    // get error
    this.process.stderr.on('data', function(err){
        stderr += err;
    });

    this.process.stdout.on('data', function (data) {
        stdout += data;
    });

    // Code is always 0 with mpg even with error ...
    this.process.once('close', function (code, sig) {
        if(stderr != ''){
            self.emit('error', new Error('Unable to play sound: ' + stderr));
        }
        else{
            self.emit('complete');
        }
    });
};

module.exports.prototype.stop = function () {
    this.stopped = true;
    if(this.process){
        this.process.kill('SIGTERM');
    }
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