'use strict';

var stdin = process.stdin;
var Events = require("events");

class Trigger extends Events {

    constructor(helper){
        super();
        var self = this;
        this.helper = helper;

        // without this, we would only get streams once enter is pressed
        stdin.setRawMode( true );

        // resume stdin in the parent process (node app won't quit all by itself
        // unless an error or process.exit() happens)
        stdin.resume();

        // i don't want binary, do you?
        stdin.setEncoding( 'utf8' );

        // on any data into stdin
        stdin.on( 'data', function( key ){

            // ctrl-c ( end of text )
            // if ( key === '\u0003' ) {
            //     process.exit();
            // }

            // write the key to stdout all normal like
            process.stdout.write( "key: " + key + "\n" );
            self.emit("pressed", key);
        });
    }

    initialize(done)
    {
        var self = this;

        // A new task has been registered with this module
        // this.helper.onNewWatch(function(options, cb){
        //
        //     self.helper.getLogger().debug('Watch for keypress %s', JSON.stringify(options));
        //
        //     // on any data into stdin
        //     stdin.on( 'data', function( key ){
        //
        //         if(key === options.key){
        //             self.helper.getLogger().info('You have pressed the key %s', key);
        //             return cb();
        //         }
        //
        //     });
        // });

        return done();
    }

    newTrigger(options, cb) {
        this.on("pressed", function(key) {
            cb();
        });
    }
}

module.exports = Trigger;