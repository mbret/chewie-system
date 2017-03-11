/**
 * This is the plugin
 */
class Plugin {

    /**
     * @param {Object} chewie - Chewie instance
     * @param {Object} helper - This helper provide some convenient methods that are often used
     * in plugins. Ex: logger with your namespace set automatically.
     */
    constructor(chewie, helper) {
        // as the plugin instance is passed to each modules it could be useful to
        // keep access to chewie instance.
        this.chewie = chewie;
        // like chewie, it may be useful to have access to helper inside the modules
        this.helper = helper;
    }

    /**
     * Mount function is called everytime the plugin is mount.
     * Note that a plugin cannot be mounted more than once in the same time.
     * As long as you are not calling the callback function the plugin will not be
     * fully mounted and module for example will not be loaded. Do not forget it!
     * @param {Function} done
     */
    mount(done) {
        done();
    }

    /**
     * This function is called everytime your plugin is unmount and have to shutdown.
     * As long as you are not calling the callback function the plugin wait to be stopped. Do not forget it!
     * @param {Function} done
     */
    unmount(done) {
        done();
    }
}

module.exports = Plugin;