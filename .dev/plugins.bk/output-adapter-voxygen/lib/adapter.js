'use strict';

var crypto = require('crypto');
var config = require('../config');
var fs = require('fs');
var request = require('request');

class Adapter {

    constructor(helper){
        this.helper = helper;
        this.tmpDir = this.helper.getPluginTmpDir();
        this.dataDir = this.helper.getPluginDataDir();
    }

    initialize(cb)
    {
        var self = this;

        // this.executeMessage('coucou');

        return cb();
    }

    executeMessage(message, options) {
        var self = this;
        this._extractSound(this.helper.getPluginOptions().voice, message, function (err, fileName) {
            if (err) {
                self.helper.getLogger().error('Unable to extract voxygen sound', err);
                self.helper.notify('warning', 'Unable to play sound, something seems broken :/');
                return;
            }

            self.helper.speaker.playFile(fileName);
        });
    }

    /**
     *
     * @param voice
     * @param text
     * @param cb
     */
    _extractSound(voice, text, cb){

        var self = this;
        var textMd5 = crypto.createHash('md5').update(text).digest('hex');
        var url = config.voxygenBasePath.replace(':voice', voice).replace(':text', encodeURI(text));
        var fileName = this.tmpDir + '/:voice-:text.mp3'.replace(':voice', voice).replace(':text', textMd5);

        if(this._soundExist(fileName)){
            this.helper.getLogger().debug('A voxygen voice file that match this text has been found in tmp folder, using it instead %s', fileName);
            return cb(null, fileName);
        }

        this.helper.getLogger().debug('request voice for voxygen web service at %s', url);
        request.get(url)
            .on('error', function(err) {
                if(cb){
                    return cb(err);
                }
            })
            .on('response', function(response){
                if(response.statusCode === 400){
                    fs.unlink(fileName);
                    return cb(new Error('Invalid request made to voxygen'));
                }
                else {
                    self.helper.getLogger().debug('Voxygen voice correctly downloaded and available at %s', fileName);
                    return cb(null, fileName);
                }
            })
            .on('end', function(response){
                // nothing
            })
            .pipe(fs.createWriteStream(fileName));
    }

    /**
     *
     * @param fileName
     * @returns {boolean}
     * @private
     */
    _soundExist(fileName){

        try {
            var stats = fs.lstatSync(fileName);
        }
        catch (e) {
            if(e.code === 'ENOENT'){
                return false;
            }
            throw e;
        }

        // Is it a directory?
        return stats.isFile();
    }
}

module.exports = Adapter;