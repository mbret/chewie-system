'use strict';

let crypto = require('crypto');
let fs = require('fs');
let request = require('request');
let os = require('os');
let path = require('path');

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

export class VoxygenAdapter {

    static extract(text, options: any = {}) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let locale = options.locale || defaultLocale;
            let voice = options.voice || defaultVoice[locale];
            let tmpDir = options.tmpDir || defaultTmpDir;

            // build extract url
            let url = voxygenBasePath.replace(':voice', voice).replace(':text', encodeURI(text));

            // build filename
            let textMd5 = crypto.createHash('md5').update(text).digest('hex');
            let fileName = path.join(tmpDir, '/node-voxygen-module-:voice-:text.mp3').replace(':voice', voice).replace(':text', textMd5);

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
        let stats = null;
        try {
            stats = fs.lstatSync(filename);
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