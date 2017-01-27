const path = require("path");
const inject = require('gulp-inject');
const series = require('stream-series');

let streams = {
    app: [
        './public/app/**/*.module.js',
        './public/app/**/module.js',
        './public/app/**/*.js',

        // ignore screens file for now
        '!./public/app/screens/**/*.js'
    ]
};

/**
 * Inject the js files from several stream into index.ejs
 */
module.exports = function (gulp, config) {
    return {
        name: "inject-js",
        fn: function() {
            let target = gulp.src("./public/index.html");

            // It's not necessary to read the files (will speed up things), we're only after their paths:
            let appStream = gulp.src(streams.app, {
                read: false,
                cwd: config.distAppPath
            });
            let vendorStream = gulp.src(config.vendorsToInject, {
                read: false,
                cwd: config.distAppPath
            });

            return target
                .pipe(inject(series(vendorStream, appStream), {
                    ignorePath: "/public",
                }))
                .pipe(gulp.dest(config.buildPath));
        }
    };
};
