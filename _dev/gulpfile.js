'use strict';

var gulp = require('gulp');
var install = require("gulp-install");

gulp.task('install_dev_plugins', function(){
    gulp.src([__dirname + '/plugins/*/package.json'])
        .pipe(install());
});

gulp.task('install_dev', ['install_dev_plugins'], function(){
    gulp.src([__dirname + '/../package.json'])
        .pipe(install());
});