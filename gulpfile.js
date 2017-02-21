// grab our gulp packages
let gulp  = require('gulp');
let gutil = require('gulp-util');
const changed = require('gulp-changed');

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

// create a default task and just log a message
gulp.task('build', gulp.series("copy"));

gulp.task("watch", function() {
    let tasks = ["copy"];
    let watcher = gulp
        .watch(glob, gulp.series.call(null, tasks));
    watcher.on("all", (event, filepath) => gutil.log(gutil.colors.yellow('Event "%s" on file "%s", running tasks [%s]'), event, filepath, tasks));
});