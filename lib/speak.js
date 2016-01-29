'use strict';

var logger          = LOGGER.getLogger('Speak');

class Speak{

    constructor(){
        this.adapter = null;
    }

    setAdapter(adapter){
        this.adapter = adapter;
    }

    play(text){
        if(this.adapter === null){
            logger.warn('You are trying to speak but no speak adapter set yet');
            return;
        }

        this.adapter.play(text);
    }
}

module.exports = Speak;