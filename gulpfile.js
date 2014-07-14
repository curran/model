// The gulpfile that runs the build process for model.js.
//
// Curran Kelleher July 2014
var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    rjs = require('gulp-requirejs'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    docco = require('gulp-docco'),
    rename = require('gulp-rename'),

    // Globs for the module and unit test source files.
    theCode = ['src/**/*.js','tests/**/*.js'],

    // The name of the top-level module to create.
    moduleName = 'model';

// The default task runs all the others.
// This executes when you run "gulp"
gulp.task('default', ['lint', 'build', 'test', 'docs']);

// Checks code quality using JSHint, outputs a stylish report.
gulp.task('lint', function() {
  gulp.src(theCode)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

// Bundles all the AMD modules together into a single file,
// outputs non-minified and minified versions of the combined file.
gulp.task('build', function() {

  // Bundle all the AMD modules together into a single file.
  rjs({
    // Use packages so module names to not conflict with other libraries.
    // For example, without using packages, the combined file would include
    // define('myHelperModule'), but using packages, it changes to
    // define('myModule/myHelperModule'), which is less likely to produce a conflict.
    packages: [
      {
        name: moduleName,
        main: moduleName,
        location: '.'
      }
    ],
    name: moduleName,
    out: moduleName + '.js',
    baseUrl: 'src',
  })
    // Output the non-minified version.
    .pipe(gulp.dest('dist'))

    // Output the minified version.
    .pipe(uglify())
    .pipe(rename(moduleName + '-min.js'))
    .pipe(gulp.dest('dist'));
});

// Runs all the unit tests using Mocha, reports the results.
gulp.task('test', ['build'], function () {
  gulp.src(['tests/**/*.js'])
    .pipe(mocha({ reporter: 'spec' }));
});

// Builds documentation using Docco.
gulp.task('docs', function () {
  gulp.src(theCode).pipe(docco()).pipe(gulp.dest('docs'))
});
