'use strict';

var logger = LOGGER.getLogger('Speaker');
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
        if(this.adapter === null){
            logger.warn('You are trying to use speaker but no speaker adapter are set yet');
            return;
        }

        var sound = this.adapter.playFile(filename);

        // watch for system stop
        // stop the current sound (running or not) to avoid having mpg123 playsing sound
        // even if system is not running.
        taskQueue.register('shutdown', function(cb){
            sound.close();
            return cb();
        });

        return sound;
    }
}

module.exports = Speaker;