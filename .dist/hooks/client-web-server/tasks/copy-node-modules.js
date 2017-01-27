let path = require("path");

module.exports = function (gulp, config) {
    return {
        name: "copy-node-modules",
        fn: function() {
            return gulp
                .src(config.nodeModulesToCopy.map(function(name) {
                    return path.join(config.nodeModulesPath, name + "/**/*");
                }), { base: config.nodeModulesPath })
                .pipe(gulp.dest("./public/node_modules"))
        }
    };
};
