'use strict';

var logger = LOGGER.getLogger('Speaker');

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
        console.log('SDFSDF');
        this.adapter = adapter;
    }

    playFile(filename){
        if(this.adapter === null){
            logger.warn('You are trying to use speaker but no speaker adapter are set yet');
            return;
        }

        this.adapter.playFile(filename);
    }
}

module.exports = Speaker;