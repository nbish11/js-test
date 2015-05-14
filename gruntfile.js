/**
 * @file
 *
 * ### Responsibilities
 * - automate common tasks using grunt
 *
 * Scaffolded with generator-microjs v0.1.2
 *
 * @author Nathan <>
 */
'use strict';

module.exports = function (grunt) {
  var config = {
    app: '.',
    dist: '.'
  };

  grunt.initConfig({
    config: config,
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'gruntfile.js',
        '<%= config.app %>/{,*/}*.js',
        'test/spec/{,*/}*.js'
      ]
    },
    karma: {
      unit: {
        configFile: 'test/karma.conf.js'
      }
    }
  });

  require('load-grunt-tasks')(grunt);
  
  grunt.registerTask('test', ['jshint', 'karma:unit']);
  grunt.registerTask('build', ['uglify']);
  grunt.registerTask('default', ['test', 'build']);
};