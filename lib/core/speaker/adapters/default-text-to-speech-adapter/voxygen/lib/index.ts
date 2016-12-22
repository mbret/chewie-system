'use strict';

var crypto = require('crypto');
var fs = require('fs');
var request = require('request');
var os = require('os');
var path = require('path');

/**
 * Voxygen unofficial module.
 * It use the demo api to extract sounds.
 *
 * https://www.voxygen.fr/content/catalogue-voix-langues
 */

const defaultLocale = 'en';
const defaultVoice = {
    en: 'Jenny',
    fr: 'Helene'
};
const voxygenBasePath = "http://www.voxygen.fr/sites/all/modules/voxygen_voices/assets/proxy/index.php?method=redirect&voice=:voice&text=:text";
const defaultTmpDir = os.tmpdir();

class Adapter {

    static extract(text, options = {}) {

        var self = this;

        return new Promise(function(resolve, reject) {

            var locale = options.locale || defaultLocale;
            var voice = options.voice || defaultVoice[locale];
            var tmpDir = options.tmpDir || defaultTmpDir;

            // build extract url
            var url = voxygenBasePath.replace(':voice', voice).replace(':text', encodeURI(text));

            // build filename
            var textMd5 = crypto.createHash('md5').update(text).digest('hex');
            var fileName = path.join(tmpDir, '/node-voxygen-module-:voice-:text.mp3').replace(':voice', voice).replace(':text', textMd5);

            // try first to get tmp file instead of request voxygen api
            if(self._fileExistInTmpDir(fileName)) {
                return resolve(fileName);
            }

            // make request to extract sound
            request.get(url)
                .on('error', function(err) {
                    return reject(err);
                })
                .on('response', function(response){
                    if(response.statusCode === 400){
                        // clean on error
                        fs.unlink(fileName);
                        return reject(new Error('Invalid request made to voxygen'));
                    }
                    else {
                        return resolve(fileName);
                    }
                })
                .on('end', function(response){
                    // nothing
                })
                .pipe(fs.createWriteStream(fileName));

        });
    }

    static _fileExistInTmpDir(filename) {
        try {
            var stats = fs.lstatSync(filename);
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