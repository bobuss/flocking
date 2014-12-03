module.exports = function (grunt) {

  "use strict";
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: [
        'src/*.js',
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    clean: ['js/'],
    browserify: {
      'js/index.js': ['src/index.js']
    },
    // Uglify browser libs
    uglify: {
      dist: {
        files: {
          'js/index.min.js': ['js/index.js'],
        }
      }
    },
  });

  // Load plug-ins
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // define tasks
  grunt.registerTask('default', [
    'jshint', 'clean', 'browserify', 'uglify'
  ]);
};