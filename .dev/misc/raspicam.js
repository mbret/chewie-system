var RaspiCam = require("raspicam");
var camera = new RaspiCam({
    mode: "photo",
    output: "/home/pi/nas/Guests/photo-" + new Date() + ".jpg",
    quality: 100,
    width: 1920,
    height: 1080
});

//to take a snapshot, start a timelapse or video recording
camera.start();