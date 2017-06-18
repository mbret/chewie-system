const changed = require('gulp-changed');

module.exports = (config, gulp) => {
  return () => {
    return gulp
      .src(config.srcJsFilesGlob, {base: "./src"})
      .pipe(changed(config.distPath))
      .pipe(gulp.dest(config.distPath));
  }
}