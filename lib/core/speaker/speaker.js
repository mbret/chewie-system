'use strict';

var taskQueue = require('my-buddy-lib').taskQueue;

/**
 * This class is used to output sound.
 * It works only by using an adapter that provide various method.
 * For now we can use only one speaker adapter at a time.
 *
 * The adapter is a user module that has some methods.
 *  .playText() => play simple string to the speakers
 *  .playFile() => play file to the speakers
 */
class Speaker{

    constructor(){
        this.logger = MyBuddy.logger.Logger.getLogger('Speaker');

        this.adapter = null;
    }

    setAdapter(adapter){
        this.adapter = adapter;
    }

    /**
     * Automatically play the audio file and return a sound instance.
     *
     * @param filename
     * @returns {*}
     */
    playFile(filename){
        var self = this;
        this.logger.debug('Playing sound file %s', filename);

        if(this.adapter === null){
            this.logger.warn('You are trying to use speaker but no speaker adapter are set yet');
            return;
        }

        var sound = this.adapter.playFile(filename);

        sound.on('error', function(err){
            self.logger.debug('An error happened while playing file %s. Err:', filename, err);
        });

        // watch for system stop
        // stop the current sound (running or not) to avoid having mpg123 playsing sound
        // even if system is not running.
        taskQueue.register('shutdown', function(cb){
            sound.close();
            return cb();
        });

        return sound;
    }

    kill(){
        if(this.adapter === null){
            return;
        }
        this.adapter.kill();
    }
}

module.exports = Speaker;