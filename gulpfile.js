// grab our gulp packages
let gulp  = require('gulp');
let gutil = require('gulp-util');
const changed = require('gulp-changed');
let vfs = require('vinyl-fs');

let glob = [
    // copy all json files to dist (hooks installation, etc)
    "./src/**/*",
    "!./src/**/*.ts",
    "!./src/**/README.md",
    "!./src/**/.gitkeep",
    "!./src/**/.gitignore",
    "!./src/**/package.json",
    "./src/hooks/**/package.json",
    "!./src/**/*.ts",
    // ignore public from client-web-server hook to avoid large data
    "!./src/hooks/client-web-server/public/**/*"
];

gulp.task("copy", function() {
    return gulp
        .src(glob, {base: "./src"})
        .pipe(changed("./.dist"))
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

// create a default task and just log a message
gulp.task('build', gulp.series("copy"));

gulp.task("watch", function() {
    let tasks = ["copy"];
    let watcher = gulp
        .watch(glob, gulp.series.call(null, tasks));
    watcher.on("all", (event, filepath) => gutil.log(gutil.colors.yellow('Event "%s" on file "%s", running tasks [%s]'), event, filepath, tasks));
});