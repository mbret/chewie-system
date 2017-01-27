let path = require("path");

module.exports = function (gulp, config) {
    return {
        name: "copy-node-modules",
        fn: function() {
            // @todo use options.cwd for src (cwd: config.distAppPath)
            return gulp
                .src(config.nodeModulesToCopy.map(function(name) {
                    return path.join(config.nodeModulesPath, name + "/**/*");
                }), { base: config.nodeModulesPath })
                .pipe(gulp.dest(path.join(config.buildPath, "node_modules")))
        }
    };
};
