// grab our gulp packages
let gulp  = require('gulp');
let gutil = require('gulp-util');

// create a default task and just log a message
gulp.task('build', ["copy"], function() {
    return gutil.log('Gulp is running!')
});

gulp.task("copy", function() {
    gulp
        .src([
            // copy all json files to dist (hooks installation, etc)
            "./src/**/*",
            "!./src/**/*.ts",
            // ignore public from client-web-server hook to avoid large data
            "!./src/hooks/client-web-server/public/**/*"
        ])
        .pipe(gulp.dest("./.dist"));
});