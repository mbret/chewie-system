// grab our gulp packages
let gulp = require('gulp')
let gutil = require('gulp-util')
let vfs = require('vinyl-fs')
const less = require('gulp-less')
const changed = require('gulp-changed');
let path = require('path')
const inject = require('gulp-inject')
const series = require('stream-series')
const _ = require('lodash')
const merge = require('merge-stream')
const tasks = require('./tasks')
let ngAnnotate = require('gulp-ng-annotate')
let basePath = __dirname
let copyOfNodeModulesDestPath = './public/node_modules'
let distAppPath = path.join(basePath, '/.dist/hooks/client-web-server')
let srcAppPath = path.join(basePath, 'src/hooks/client-web-server')
let buildPath = path.join(distAppPath, '.build')
copyOfNodeModulesDestPath = path.join(distAppPath, copyOfNodeModulesDestPath)

let config = {
  distPath: '.dist',
  publicPath: __dirname + '/public',
  buildPath: buildPath,
  basePath: basePath,
  srcAppPath: srcAppPath,
  nodeModulesPath: path.join(basePath, 'node_modules'),
  copyOfNodeModulesDestPath: copyOfNodeModulesDestPath,
  distAppPath: distAppPath,
  env: process.env.NODE_ENV,
  srcJsFilesGlob: [
    'src/**/*.*',
    '!src/**/*.ts',
    // ignore public from client-web-server hook to avoid large data
    '!src/hooks/client-web-server/public/**/*'
  ],
  vendorsToInject: [
    'vendors/jquery/dist/jquery.js',
    'vendors/jquery-slimscroll/jquery.slimscroll.min.js',
    'vendors/angular/angular.js',
    'vendors/angular-ui-router/release/angular-ui-router.js',
    'vendors/angular-messages/angular-messages.js',
    'vendors/angular-ui-bootstrap/dist/ui-bootstrap.js',
    'vendors/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
    'vendors/socket.io-client/dist/socket.io.slim.js',
    'vendors/angular-socket-io/socket.min.js',
    'vendors/iCheck/icheck.js',
    'vendors/masonry/dist/masonry.pkgd.min.js',
    'vendors/bootstrap-daterangepicker/daterangepicker.js',
    'vendors/angular-daterangepicker/js/angular-daterangepicker.min.js',
    'vendors/angular-toastr/dist/*.min.js',
    'vendors/angular-translate/dist/angular-translate.js',
    'vendors/angular-oauth2/dist/*.min.js',
    'vendors/angular-cookies/*.min.js',
    // "vendors/query-string/*.js",
    'vendors/angular-logger/dist/*.min.js',
    'vendors/angular-ui-tree/dist/angular-ui-tree.js',
    'vendors/angular-masonry/angular-masonry.js',
    'vendors/ngstorage/ngStorage.js',
    'vendors/angular-jwt/dist/angular-jwt.min.js'
  ]
}

// -------------------------------------------
//
//     Tasks relative to client-web-server
//
// -------------------------------------------

//ajax.googleapis.com/ajax/libs/angularjs/X.Y.Z/angular-cookies.js
gulp.task('client-web-server:copy-vendors-local', function () {
  return gulp.src([
    config.srcAppPath + '/public/vendors/angular-logger/dist/**/*',
    config.srcAppPath + '/public/vendors/angular-messages/angular-messages.js',
    config.srcAppPath + '/public/vendors/iCheck/**/*',
    config.srcAppPath + '/public/vendors/masonry/dist/**/*',
    config.srcAppPath + '/public/vendors/bootstrap-daterangepicker/**/*',
  ], {base: config.srcAppPath + '/public/vendors'})
    .pipe(gulp.dest(config.buildPath + '/vendors'))
})

// find the root path of node_module module
// C:\Users\mbret\Workspace\chewie-system\node_modules\gulp-cli\bin\gulp.js => C:\Users\mbret\Workspace\chewie-system\node_modules\gulp-cli
function extractBaseNodeModulePath (moduleName) {
  let rex = new RegExp('(.+)' + _.escapeRegExp(path.sep + 'node_modules' + path.sep + moduleName), 'g')
  return rex.exec(require.resolve(moduleName))[0]
}

function getPipe (moduleName, glob) {
  let modulePath = extractBaseNodeModulePath(moduleName)
  let moduleBase = modulePath.slice(0, -(moduleName.length + 1))
  return gulp.src(modulePath + glob, {base: moduleBase})
}

gulp.task('client-web-server:copy-vendors-npm', function () {
  return merge(
    getPipe('jquery', '/dist/jquery.js'),
    getPipe('jquery-slimscroll', '/jquery.slimscroll.min.js'),
    getPipe('angular', '/angular.js'),
    getPipe('angular-ui-router', '/release/angular-ui-router.js'),
    getPipe('angular-ui-bootstrap', '/dist/**/*'),
    getPipe('socket.io-client', '/dist/socket.io.slim.js'),
    getPipe('angular-socket-io', '/socket.min.js'),
    getPipe('angular-daterangepicker', '/js/angular-daterangepicker.min.js'),
    getPipe('angular-translate', '/dist/angular-translate.js'),
    getPipe('ngstorage', '/ngStorage.js'),
    getPipe('angular-masonry', '/angular-masonry.js'),
    getPipe('angular-ui-tree', '/dist/**/*'),
    getPipe('angular-oauth2', '/dist/*.min.js'),
    getPipe('angular-toastr', '/dist/**/*'),
    getPipe('awesome-bootstrap-checkbox', '/awesome-bootstrap-checkbox.css'),
    getPipe('angular-cookies', '/*.min.js'),
    getPipe('angular-jwt', '/dist/angular-jwt.min.js')
  )
    .pipe(gulp.dest(config.buildPath + '/vendors'))
})

gulp.task('client-web-server:symlinks', gulp.parallel('client-web-server:copy-vendors-npm', 'client-web-server:copy-vendors-local', function () {
  return gulp.src([
    'public/resources',
  ], {
    cwd: config.srcAppPath
  })
    .pipe(gulp.symlink(config.buildPath))
}))

gulp.task('client-web-server:copy-public', function () {
  return gulp
    .src([
        'public/**/**',
        '!public/{css,css/**}',
        '!public/resources/**',
        '!public/vendors/**',
        '!public/**/**.js',
      ], {
        cwd: config.srcAppPath
      }
    )
    .pipe(changed(config.buildPath))
    .pipe(gulp.dest(config.buildPath))
})

gulp.task('client-web-server:process-js', function () {
  return gulp
    .src([
        'public/**/**.js',
        '!public/resources/**',
        '!public/vendors/**',
      ], {
        cwd: config.srcAppPath
      }
    )
    .pipe(ngAnnotate())
    .pipe(gulp.dest(config.buildPath))
})

gulp.task('client-web-server:inject-js', gulp.series(gulp.parallel('client-web-server:process-js', 'client-web-server:copy-public'), function () {
  let target = gulp.src(config.srcAppPath + '/public/index.html')

  // It's not necessary to read the files (will speed up things), we're only after their paths:
  let appStream = gulp.src([
    'app/**/*.module.js',
    'app/**/module.js',
    'app/**/*.js',

    // ignore screens file for now
    '!app/screens/**/*.js'
  ], {
    read: false,
    cwd: config.distAppPath + '/.build'
  })
  let vendorsStream = gulp.src(config.vendorsToInject, {
    read: false,
    cwd: config.distAppPath + '/.build'
  })

  return target
    .pipe(inject(series(vendorsStream, appStream), {
      ignorePath: '/public',
    }))
    .pipe(gulp.dest(config.buildPath))
}))

gulp.task('client-web-server:watch-less', function () {
  return gulp.watch([
    config.srcAppPath + 'public/css/**/*.less',
    config.srcAppPath + 'public/app/**/*.less'
  ], gulp.series('client-web-server:build-less'))
})

gulp.task('client-web-server:watch-public', function () {
  return gulp.watch([
    config.srcAppPath + '/public/**/**',
    '!' + config.srcAppPath + '/public/css'
  ], gulp.parallel('client-web-server:inject-js'))
})

gulp.task('client-web-server:build-less', function () {
  return gulp.src(config.srcAppPath + '/public/css/style.less')
    .pipe(less())
    .pipe(gulp.dest(path.join(config.buildPath, '/css')))
})

gulp.task('client-web-server:build', gulp.series('client-web-server:symlinks', gulp.parallel('client-web-server:build-less', 'client-web-server:inject-js')))
gulp.task('client-web-server:watch', gulp.parallel('client-web-server:watch-less', 'client-web-server:watch-public'))

// -------------------------------------------
//
//     Globals Tasks
//
// -------------------------------------------

gulp.task('copy', tasks.copy(config, gulp))
gulp.task('clean', tasks.clean(config, gulp))
gulp.task('build', tasks.build(config, gulp))
gulp.task('watch', gulp.parallel('client-web-server:watch', tasks.watch(config, gulp)))

// -------------------------------------------
//
//     Various dev tasks
//
// -------------------------------------------

// must be run as admin
gulp.task('generate-plugins-symlink', function () {
  return vfs.src('../chewie-plugin-date-time', {followSymlinks: false})
    .pipe(vfs.symlink('.dev/plugins'))
})

// must be run as admin
gulp.task('generate-dev-app-symlink', function () {
  return vfs.src('../chewie-app', {followSymlinks: false})
    .pipe(vfs.symlink('.dev'))
})