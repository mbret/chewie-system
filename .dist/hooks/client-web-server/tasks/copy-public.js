module.exports = function (gulp, config) {
    return {
        name: "copy-public",
        fn: function() {
            gulp
                .src(
                    [
                        "./public/**/**",
                        "!./public/{css,css/**}"
                    ],
                    {
                        cwd: config.srcAppPath
                    }
                )
                .pipe(gulp.dest(config.buildPath));
        }
    };
};
