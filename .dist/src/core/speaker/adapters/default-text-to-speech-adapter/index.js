'use strict';
const voxygen_adapter_1 = require("./voxygen-adapter");
class TextToSpeechDefaultAdapter {
    constructor(system) {
        this.system = system;
    }
    initialize(cb) {
        return cb();
    }
    extract(text) {
        return voxygen_adapter_1.VoxygenAdapter.extract(text, { locale: 'fr', tmpDir: this.system.config.system.tmpDir });
    }
}
module.exports = TextToSpeechDefaultAdapter;
//# sourceMappingURL=index.js.map