'use strict';
import {VoxygenAdapter} from "./voxygen-adapter";
import {System} from "../../../../system";

class TextToSpeechDefaultAdapter {

    system: System;

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
        return VoxygenAdapter.extract(text, {locale: 'fr', tmpDir: this.system.config.systemTmpDir});
    }
}

module.exports = TextToSpeechDefaultAdapter;