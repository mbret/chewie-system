var os = require('os');
var path = require('path');

var localAppDataDir = os.platform() === 'win32' || os.platform() === 'win64' ? process.env.LOCALAPPDATA : os.homedir();

/**
 * Config relative to plugins.
 *
 */
module.exports.system = {
    tmpDir: path.join(os.tmpdir(), '.my-buddy'),
    dataDir: path.join(localAppDataDir, '.my-buddy', 'data'),
    // persistenceDir: path.join(localAppDataDir, '.my-buddy', 'storage'),

    // runtime set
    // Either forced in config or set during runtime using tmpDir, dataDir, etc
    synchronizedPluginsDir: undefined,
    pluginsTmpDir: undefined,
    pluginsDataDir: undefined,

    // By default there are no speaker adapter.
    // The system may run without adapter it will just no output sound.
    speakerAdapter: null,
};