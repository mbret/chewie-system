module.exports = (config, gulp) => {
  return gulp.parallel("copy", "client-web-server:build")
}