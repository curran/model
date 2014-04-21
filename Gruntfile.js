module.exports = function(grunt){

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
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
        objectToExport: 'Model'
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
    }
  });

  grunt.registerTask('build', ['jshint', 'umd', 'uglify']);
  grunt.registerTask('default', ['build', 'jasmine', 'docco']);
};
