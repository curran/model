module.exports = function(grunt){
  'use strict';

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    watch: {
      build: {
        files: ['<%= jshint.all %>'],
        tasks: ['default']
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js', 'spec/**/*.js']
    },
    uglify: {
      dist: {
        files: {'dist/model.min.js': ['dist/model.js']}
      }
    },
    umd: {
      all: {
        src: 'src/model.js',
        dest: 'dist/model.js',
        objectToExport: 'model'
      }
    },
    docco: {
      all: {
        src: ['src/**/*.js', 'spec/**/*.js'],
        options: {
          output: 'docs/'
        }
      }
    },
    jasmine: {
      all: {
        options: {
          specs: 'spec/*Spec.js',
          helpers: 'spec/*Helper.js',
          vendor: ['lib/requirejs/require.js', 'requireConfig.js'],
          globalAlias: 'model'
        }
      }
    },
    express: {
      serve: {
        server: 'server.js',
        livereload: true
      }
    }
  });

  grunt.registerTask('build', ['jshint', 'umd', 'uglify']);
  grunt.registerTask('default', ['build', 'jasmine']);
  grunt.registerTask('serve', ['express', 'express-keepalive']);
};