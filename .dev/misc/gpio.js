// https://github.com/fivdi/gpio-button

// var Button = require('gpio-button');
var Gpio = require('onoff').Gpio, // Constructor function for Gpio objects.
    led = new Gpio(17, 'out'),      // Export GPIO #14 as an output.
    iv;
var button = new Gpio(22, 'in', 'both');
// var button22 = new Button('button22');
var button2 = new Gpio(22, 'in', 'both');
// led.writeSync(1);
// Toggle the state of the LED on GPIO #14 every 200ms.
// Here synchronous methods are used. Asynchronous methods are also available.
// iv = setInterval(function () {
//     led.writeSync(led.readSync() ^ 1); // 1 = on, 0 = off :)
// }, 200);

// Stop blinking the LED and turn it off after 5 seconds.
// setTimeout(function () {
//     clearInterval(iv); // Stop blinking
//     led.writeSync(0);  // Turn LED off.
//     led.unexport();    // Unexport GPIO and free resources
// }, 5000);
button.setActiveLow(true);
button.watch(function(err, value) {
    if (err) {
        throw err;
    }
    if(value === 1) {
        console.log("released");
    }
    if(value === 0) {
        console.log("pressed");
    }
    led.writeSync(value);
});

button2.watch(function(err, value) {
    console.log(err, "coucou");
});

// button22.on('press', function () {
//     console.log('press');
// });
//
// button22.on('hold', function () {
//     console.log('hold');
// });
//
// button22.on('release', function () {
//     console.log('release');
// });

process.on('SIGINT', function () {
    led.unexport();
    button.unexport();
});