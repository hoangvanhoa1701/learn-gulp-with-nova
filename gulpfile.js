"use strict";
var gulp = require("gulp");

// Requires the gulp-sass plugin
var sass = require("gulp-sass");
sass.compiler = require("node-sass");

// Live-reloading with Browser Sync
var browserSync = require("browser-sync").create();

// Optimizing CSS and JavaScript files
var useref = require("gulp-useref");
var gulpIf = require("gulp-if");
var uglify = require("gulp-uglify");
var cssnano = require("gulp-cssnano");

// Optimizing Image files
var imagemin = require("gulp-imagemin");

var cache = require("gulp-cache");
var del = require("del");
const autoprefixer = require("gulp-autoprefixer");

gulp.task("hello-world", async function () {
  console.log("hello world!");
});

gulp.task("sass", function () {
  return gulp
    .src("app/scss/*.scss", { allowEmpty: true }) // Get source files with gulp.src
    .pipe(sass().on("error", sass.logError)) // Using gulp-sass
    .pipe(gulp.dest("app/css")) // Outputs the file in the destination folder
    .pipe(browserSync.reload({
      stream: true
    })) // Live-reloading with Browser Sync
});

gulp.task("autoprefixer", function () {
  console.log("runte!");
  return gulp
    .src("dist/css/styles.min.css", { allowEmpty: true })
    .pipe(autoprefixer({
      cascade: false,
    }))
    .pipe(gulp.dest("dist/css")) // Outputs the file in the destination folder
    .pipe(browserSync.reload({
      stream: true
    })) // Live-reloading with Browser Sync
});

gulp.task("watch", function () {
  gulp.watch("app/*.html", gulp.series(["useref"]));
  gulp.watch("app/scss/**/*.scss", gulp.series(["sass", "useref", "autoprefixer"]));
  gulp.watch("app/images/**", gulp.series(["images"]));

  // Reloads the browser whenever HTML or JS files change
  gulp.watch("app/*.html", browserSync.reload);
  gulp.watch("app/js/**/*.js", browserSync.reload);
});

gulp.task("browserSync", function () {
  browserSync.init({
    server: {
      baseDir: "app",
    },
  });
});

gulp.task("useref", function () {
  return (
    gulp
      .src("app/*.html", { allowEmpty: true })
      .pipe(useref())
      // Minifies only if it's a JavaScript file
      .pipe(gulpIf("*.js", uglify()))
      // Minifies only if it's a CSS file
      .pipe(gulpIf("*.css", cssnano()))
      .pipe(gulp.dest("dist"))
  );
});

gulp.task("images", function () {
  return (
    gulp
      .src("app/images/**/*.+(png|jpg|gif|svg)")
      .pipe(
        imagemin([
          imagemin.mozjpeg({ quality: 20, progressive: true}),
          imagemin.optipng({ optimizationLevel: 5 }),
        ])
      )
      .pipe(gulp.dest("dist/images"))
  );
});

gulp.task("images-cache", function () {
  return (
    gulp
      .src("app/images/**/*.+(png|jpg|gif|svg)")
      // Caching images that ran through imagemin
      .pipe(
        cache(
          imagemin([
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
          ])
        )
      )
      .pipe(gulp.dest("dist/images"))
  );
});

gulp.task("clean:dist", function () {
  return del.sync("dist");
});

gulp.task("default", gulp.series(["watch"]));
