const path = require("path");
const less = require('gulp-less');

/**
 * Compile the less files
 */
module.exports = function (gulp, config) {
    return {
        name: "build-less",
        fn: function () {
            return gulp.src("./public/css/style.less")
                .pipe(less())
                .pipe(gulp.dest(path.join(config.buildPath, "/css")));
        }
    };
};