module.exports = {

    mount: function(chewie, helper, done) {
        setTimeout(function() {
            return done();
        }, 1000);
    },

    unmount: function(done) {
        return done();
    }
};