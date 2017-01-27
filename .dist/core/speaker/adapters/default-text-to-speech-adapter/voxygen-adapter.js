'use strict';
let crypto = require('crypto');
let fs = require('fs');
let request = require('request');
let os = require('os');
let path = require('path');
const defaultLocale = 'en';
const defaultVoice = {
    en: 'Jenny',
    fr: 'Helene'
};
const voxygenBasePath = "http://www.voxygen.fr/sites/all/modules/voxygen_voices/assets/proxy/index.php?method=redirect&voice=:voice&text=:text";
const defaultTmpDir = os.tmpdir();
class VoxygenAdapter {
    static extract(text, options = {}) {
        let self = this;
        return new Promise(function (resolve, reject) {
            let locale = options.locale || defaultLocale;
            let voice = options.voice || defaultVoice[locale];
            let tmpDir = options.tmpDir || defaultTmpDir;
            let url = voxygenBasePath.replace(':voice', voice).replace(':text', encodeURI(text));
            let textMd5 = crypto.createHash('md5').update(text).digest('hex');
            let fileName = path.join(tmpDir, '/node-voxygen-module-:voice-:text.mp3').replace(':voice', voice).replace(':text', textMd5);
            if (self._fileExistInTmpDir(fileName)) {
                return resolve(fileName);
            }
            request.get(url)
                .on('error', function (err) {
                return reject(err);
            })
                .on('response', function (response) {
                if (response.statusCode === 400) {
                    fs.unlink(fileName);
                    return reject(new Error('Invalid request made to voxygen'));
                }
                else {
                    return resolve(fileName);
                }
            })
                .on('end', function (response) {
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
            if (e.code === 'ENOENT') {
                return false;
            }
            throw e;
        }
        return stats.isFile();
    }
}
exports.VoxygenAdapter = VoxygenAdapter;
//# sourceMappingURL=voxygen-adapter.js.map