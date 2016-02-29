'use strict';

var gulp = require('gulp');
var inject = require('gulp-inject');
// https://docs.google.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/pub
var angularFilesort = require('gulp-angular-filesort');

gulp.task('inject_js', function(){
    var target = gulp.src('./www/index.ejs');

    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var sources = gulp.src(['./public/app/**/*.js'])
        .pipe(angularFilesort());

    return target.pipe(inject(sources, {
            ignorePath: '/public/',
        }))
        .pipe(gulp.dest('./www'));
});