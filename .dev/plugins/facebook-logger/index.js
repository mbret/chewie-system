
class Plugin {
    constructor() {
        console.log("facebook-logger", "constructor");
    }
    mount(done) {
        console.log("facebook-logger", "mount");
        done();
    }
    unmount(done) {
        setTimeout(function() {
            console.log("facebook logger unmount mothe fucker");
            done();
        }, 4000);
    }
}

module.exports = Plugin;