module.exports = function (gulp, config) {
    return {
        name: "copy-node-modules",
        fn: function() {
            gulp
                .src(config.nodeModulesToCopy.map(function(name) {
                    return "./node_modules/" + name + "/**/*";
                }), { base: 'node_modules' })
                .pipe(gulp.dest(config.buildPath + "/node_modules"))
        }
    };
};
