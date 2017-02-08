const path = require("path");
const inject = require('gulp-inject');
const series = require('stream-series');

/**
 * Inject the js files from several stream into index.ejs
 */
module.exports = function (gulp, config) {
    return {
        name: "inject-js",
        fn: function() {
            let target = gulp.src("./public/index.html");

            // It's not necessary to read the files (will speed up things), we're only after their paths:
            let appStream = gulp.src([
                'app/**/*.module.js',
                'app/**/module.js',
                'app/**/*.js',

                // ignore screens file for now
                '!app/screens/**/*.js'
            ], {
                read: false,
                cwd: config.distAppPath + "/.build"
            });
            let vendorsStream = gulp.src(config.vendorsToInject, {
                read: false,
                cwd: config.distAppPath + "/.build"
            });
            let vendorsNodeModulesStream = gulp.src(config.vendorsNodeModulesToInject, {
                read: false,
                cwd: config.basePath
            });

            return target
                .pipe(inject(series(vendorsNodeModulesStream, vendorsStream, appStream), {
                    ignorePath: "/public",
                }))
                .pipe(gulp.dest(config.buildPath));
        }
    };
};
