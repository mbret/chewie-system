const clean = require('gulp-clean')

module.exports = (config, gulp) => {
  return () => {
    return gulp.src(config.distPath + '/*', {read: false}).pipe(clean())
  }
}