'use strict';

var logger = LOGGER.getLogger('Speaker');

class Speaker{

    constructor(){
        this.adapter = null;
    }

    setAdapter(adapter){
        this.adapter = adapter;
    }

    play(text){
        if(this.adapter === null){
            logger.warn('You are trying to use speaker but no speaker adapter are set yet');
            return;
        }

        this.adapter.play(text);
    }
}

module.exports = Speaker;