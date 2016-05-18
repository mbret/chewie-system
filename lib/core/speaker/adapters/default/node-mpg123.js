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

    if(this.process){
        return;
    }

    this.process = spawn(executable, [ this.filename ]);
    var self = this;

    var stderr = '';
    var stdout = '';

    // get error
    this.process.stderr.on('data', function(err){
        // @todo for now mpg123 throw everything in stderr, see why
         stderr += err;
    });

    this.process.stdout.on('data', function (data) {
        stdout += data;
    });

    // Code is always 0 with mpg even with error ...
    // but for sure one 99 code exist for some errors like invalid path
    this.process.once('close', function (code, sig) {
        self.process = null;
        if(code === 0) {
            self.emit('complete');
        }
        // code 99, ?
        else {
            self.emit('error', new Error('Unable to play sound. Did you set the mpg123 path correctly? More info about the error: ' + stderr));
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

module.exports.prototype.close = function () {
    if(this.process){
        this.process.kill('SIGTERM');
    }
    this.process = null;
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