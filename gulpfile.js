// grab our gulp packages
let gulp  = require('gulp');
let gutil = require('gulp-util');
let vfs = require('vinyl-fs');

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
            "!./src/**/README.md",
            "!./src/**/.gitkeep",
            "!./src/**/.gitignore",
            "!./src/**/package.json",
            "!./src/**/*.ts",
            // ignore public from client-web-server hook to avoid large data
            "!./src/hooks/client-web-server/public/**/*"
        ])
        .pipe(gulp.dest("./.dist"));
});

// must be run as admin
gulp.task("generate-plugins-symlink", function() {
    return vfs.src("../chewie-plugin-date-time", {followSymlinks: false})
        .pipe(vfs.symlink(".dev/plugins"));
});

// must be run as admin
gulp.task("generate-dev-app-symlink", function() {
    return vfs.src("../chewie-app", {followSymlinks: false})
        .pipe(vfs.symlink(".dev"));
});