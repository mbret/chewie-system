'use strict';

class Adapter {

    constructor(helper){
        this.helper = helper;
    }

    initialize(cb)
    {
        var self = this;

        console.log(this.helper.getPluginOptions());
        return cb();
    }

    executeMessage(message, options) {
        //this._extractSound(self.voice, text, function (err, fileName) {
        //    if (err) {
        //        return cb(err);
        //    }
        //
        //    // add element to the start of queue. It will be the next played
        //    self.queue.splice(0, 0, fileName);
        //    console.log('There is now ' + self.queue.length + ' sounds in queue');
        //    if (self.queue.length === 1 && !self.playing) {
        //        self._play(fileName, true, cb);
        //    }
        //});
    }

    /**
     *
     * @param voice
     * @param text
     * @param cb
     */
    _extractSound(voice, text, cb){

        var textMd5 = crypto.createHash('md5').update(text).digest('hex');
        var url = this.config.voxygenBasePath.replace(':voice', voice).replace(':text', encodeURI(text));
        var fileName = this.helper.getSystem().config.system.tmpDir + '/:voice-:text.mp3'.replace(':voice', voice).replace(':text', textMd5);

        if(Player.soundExist(fileName)){
            return cb(null, fileName);
        }

        console.log('request voice for %s', url);
        var tmp = request
            .get(url)
            .on('error', function(err) {
                console.log(err);
                if(cb){
                    return cb(err);
                }
            })
            .on('response', function(response){
                if(response.statusCode === 400){
                    console.error('Invalid request made to voxygen');
                    this.emit( "end" );
                    fs.unlink(fileName);
                    return cb(new Error('Invalid request made to voxygen'));
                }
            })
            .on('end', function(response){
                console.log(response);
                if(cb){
                    return cb(null, fileName);
                }
            })
            .pipe(fs.createWriteStream(fileName));
    }
}

module.exports = Adapter;