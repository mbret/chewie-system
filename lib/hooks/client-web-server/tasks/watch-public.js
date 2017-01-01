const path = require("path");

module.exports = function (gulp, config) {
    return {
        name: "watch-public",
        fn: function() {
            return gulp.watch([
                "./public/**/**",
                "!./public/css"
            ], ["copy-public"]);
        }
    };
};