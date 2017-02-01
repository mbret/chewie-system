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
            "!./src/**/README.md",
            "!./src/**/.gitkeep",
            "!./src/**/.gitignore",
            "!./src/**/package.json"
        ])
        .pipe(gulp.dest("./.dist"));
});