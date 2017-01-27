const clean = require('gulp-clean');

/**
 * Clean build folder
 */
module.exports = function (gulp, config) {
    return {
        name: "clean",
        fn: function () {
            return gulp.src(config.buildPath, {read: false}).pipe(clean());
        }
    };
};