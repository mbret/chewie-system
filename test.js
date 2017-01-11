let async = require("async");

return new Promise(function(resolve, reject) {
    callAsync(function(err) {
        // setImmediate(function() {
            if (err) {
                return reject(err);
            }

            // oups synchronized error
            throw new Error("batard");

            return resolve();
        // });
    })
});

function callAsync(done) {
    async.series([
        function(cb) {
            // something
            setTimeout(function() {
                return cb();
            }, 1000);
        }
    ], done);
}
