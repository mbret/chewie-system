const path = require("path");
let viewToInject = './www/layout.ejs';
let inject = require('gulp-inject');
let series = require('stream-series');

/**
 * Inject the js files from several stream into index.ejs
 */
module.exports = function (gulp, config) {
    return {
        name: "inject-js",
        fn: function(){
            let target = gulp.src(viewToInject);

            // It's not necessary to read the files (will speed up things), we're only after their paths:
            let appStream = gulp.src([
                './public/app/**/*.module.js',
                './public/app/**/module.js',
                './public/app/**/*.js',

                // ignore screens file for now
                '!./public/app/screens/**/*.js'
            ], {read: false});

            let vendorStream = gulp
                .src([
                    "./public/vendors/masonry/dist/masonry.pkgd.min.js",
                    './public/vendors/bootstrap-daterangepicker/daterangepicker.js',
                    './public/vendors/angular-daterangepicker/js/angular-daterangepicker.min.js',
                    './public/vendors/angular-socket-io/*.min.js',
                    './public/vendors/angular-toastr/dist/*.min.js',
                    './public/vendors/angular-translate/*.min.js',
                    './public/vendors/angular-oauth2/dist/*.min.js',
                    './public/vendors/angular-cookies/*.min.js',
                    './public/vendors/query-string/*.js',
                    './public/vendors/angular-logger/dist/*.min.js',
                    "./public/vendors/angular-ui-tree/dist/angular-ui-tree.js",
                    "./public/vendors/angular-masonry/angular-masonry.js"
                ], {read: false});

            return target
                .pipe(inject(series(vendorStream, appStream), {
                    ignorePath: '/public/',
                }))
                .pipe(gulp.dest('./www'));
        }
    };
};
