'use strict';

const voxygen = require('./voxygen/index');

class TextToSpeechDefaultAdapter {

    constructor(system) {
        this.system = system;
    }

    initialize(cb){
        return cb();
    }

    /**
     * Extract and convert a text to sound file.
     * @param text
     * @returns Promise
     */
    extract(text) {
        return voxygen.extract(text, {locale: 'fr'});
    }
}

module.exports = TextToSpeechDefaultAdapter;