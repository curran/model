// The gulpfile that runs the build process for model.js.
//
// Curran Kelleher March 2015
var gulp = require("gulp"),
    mocha = require("gulp-mocha"),
    uglify = require("gulp-uglify"),
    jshint = require("gulp-jshint"),
    stylish = require("jshint-stylish"),
    docco = require("gulp-docco"),
    rename = require("gulp-rename"),

    // Globs for the module and unit test source files.
    theCode = ["src/**/*.js","tests/**/*.js"],

    // The name of the top-level module to create.
    moduleName = "model";

// The default task runs all the others.
// This executes when you run "gulp"
gulp.task("default", ["lint", "build", "test", "docs"]);

// Checks code quality using JSHint, outputs a stylish report.
gulp.task("lint", function() {
  return gulp.src(theCode)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

// Bundles all the AMD modules together into a single file,
// outputs non-minified and minified versions of the combined file.
gulp.task("build", function() {
  return gulp.src("./src/model.js")

    // Output the non-minified version.
    .pipe(gulp.dest("./dist"))

    // Output the minified version.
    .pipe(uglify())
    .pipe(rename(moduleName + "-min.js"))
    .pipe(gulp.dest("dist"));
});

// Runs all the unit tests using Mocha, reports the results.
gulp.task("test", ["build"], function () {
  return gulp.src(["tests/**/*.js"])
    .pipe(mocha({ reporter: "spec" }));
});

// Builds documentation using Docco.
gulp.task("docs", function () {
  return gulp.src(theCode).pipe(docco()).pipe(gulp.dest("docs"))
});
