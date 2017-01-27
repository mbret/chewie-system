const path = require("path");

/**
 * Watch for any changes inside less files and run less task.
 */
module.exports = function (gulp, config) {
    return {
        name: "watch-less",
        fn: function() {
            return gulp.watch([
                "public/css/**/*.less"
            ], ["build-less"]);
        }
    };
};