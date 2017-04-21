var http = require('http');
var child_process = require('child_process');
var fs = require('fs');
var RaspiCam = require("raspicam");
var camera = new RaspiCam({

});

//listen for the "start" event triggered when the start method has been successfully initiated
camera.on("start", function(){
    console.log("camera start");
});

http.createServer(function (req, res) {
    // la commande à exécuter
    var cmd = '/opt/vc/bin/raspistill --output /var/www/image.jpg --timeout 100 --nopreview';
    // on lance la commande
    // child_process.exec(cmd, function(error, stdout, stderr){
    //     if(error) {
    //         // on affiche l'erreur dans laconsole
    //         console.log(error);
    //         // on alerte le visiteur
    //         res.writeHead(200, {'Content-Type': 'text/plain'}); res.end('execution impossible'); return;
    //     }
    //     fs.readFile('/var/www/image.jpg', function(error, data){
    //         if(error) {
    //             console.log(error); res.writeHead(200, {'Content-Type': 'text/plain'}); res.end('lecture impossible'); return;
    //         }
    //         res.writeHead(200, {'Content-Type': 'image/jpeg'}); res.end(data);
    //     });
    // });

    res.writeHead(200, { 'Cache-Control': 'no-cache', 'Cache-Control': 'private', 'Pragma': 'no-cache', 'Content-Type': 'multipart/x-mixed-replace; boundary=myboundary', });

    //listen for the "read" event triggered when each new photo/video is saved
    camera.on("read", function(err, timestamp, filename){
        //do stuff
    });
}).listen(3000);
console.log('Server running');


// var http = require('http');
// var CameraStream = require('./cameraStream');
// var camera = new CameraStream();
// camera.doStart(320,240,6);
// http.createServer(function(req, res){
//     res.writeHead(200, { 'Cache-Control': 'no-cache', 'Cache-Control': 'private', 'Pragma': 'no-cache', 'Content-Type': 'multipart/x-mixed-replace; boundary=myboundary', });
//     var consume = function(buffer) {
//         res.write("--myboundary\r\n"); res.write("Content-Type: image/jpeg\r\n");
//         res.write("Content-Length: " + buffer.length + "\r\n"); res.write("\r\n"); res.write(buffer,'binary'); res.write("\r\n");
//     } ;
//     camera.on('image', consume);
//     res.connection.on('close', function(){ camera.removeListener('image', consume); });
// }).listen(8080, function(){ console.log('mjpeg server started'); });