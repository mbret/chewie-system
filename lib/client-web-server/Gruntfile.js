'use strict';

module.exports = function (grunt) {

    grunt.option('force', true)

    // Load the project's grunt tasks from a directory
    require('grunt-config-dir')(grunt, {
        configDir: require('path').resolve('tasks')
    });
    
    // Register group tasks
    grunt.registerTask('build', ['less', 'copyto']);

    grunt.registerTask('test', [ 'mochacli' ]);

    grunt.registerTask("watch", ["build"]);
};
