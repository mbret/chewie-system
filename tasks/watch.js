const gutil = require('gulp-util')

module.exports = (config, gulp) => {
  return () => {
    let tasks = ['copy']
    let watcher = gulp
      .watch(config.srcJsFilesGlob, gulp.series.call(null, tasks))
    watcher.on('all', (event, filepath) => gutil.log(gutil.colors.yellow('Event "%s" on file "%s", running tasks [%s]'), event, filepath, tasks))
  }
}