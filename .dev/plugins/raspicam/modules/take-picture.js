"use strict";

const RaspiCam = require("raspicam");

class Module {

    constructor(helper, info) {
        this.info = info;
        this.helper = helper;
    }

    run(options) {
        let camera = new RaspiCam({
            mode: "photo",
            output: options.outputDir + (new Date()).toISOString() + ".jpg",
            quality: options.quality,
            width: options.width,
            height: options.height
        });
        camera.start();
    }
}

module.exports = Module;