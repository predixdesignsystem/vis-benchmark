'use strict';
const path = require('path');
const gulp = require('gulp');
const pkg = require('./package.json');
const $ = require('gulp-load-plugins')();
const gulpSequence = require('gulp-sequence');
const importOnce = require('node-sass-import-once');
const stylemod = require('gulp-style-modules');
const gulpif = require('gulp-if');
const combiner = require('stream-combiner2');
const bump = require('gulp-bump');
const argv = require('yargs').argv;
/* Used to transpile JavaScript */
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const cache = require('gulp-cached');
const clean = require('gulp-clean');

const sassOptions = {
  importer: importOnce,
  importOnce: {
    index: true,
    bower: true
  }
};

gulp.task('clean', function() {
  return gulp.src(['.tmp', 'css'], {
    read: false
  }).pipe($.clean());
});

function handleError(err){
  console.log(err.toString());
  this.emit('end');
}

function buildCSS(){
  return combiner.obj([
    $.sass(sassOptions),
    $.autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }),
    gulpif(!argv.debug, $.cssmin())
  ]).on('error', handleError);
}

gulp.task('sass', function() {
  return gulp.src(['./sass/*.scss'])
    .pipe(cache('sassing'))
    .pipe(buildCSS())
    .pipe(stylemod({
      moduleId: function(file) {
        return path.basename(file.path, path.extname(file.path)) + '-styles';
      }
    }))
    .pipe(gulp.dest('css'));
});

// Globbing pattern to find ES6 source files that need to be transpiled
const ES6_SRC = './*.es6.js';
// Output directory for transpiled files
const ES5_DEST = './dist';

gulp.task('transpile', function() {
  return gulp.src(ES6_SRC)
    .pipe(cache('transpiling'))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .on('error', function(err) {
      console.error(err);
      this.emit('end');
    })
    .pipe(rename(path => {
      path.basename = path.basename.replace('.es6', '');
      console.log(`Transpiling ${path.basename}.es6.js -> dist/${path.basename}.js`)
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(ES5_DEST));
});

gulp.task('watch', function() {
 // gulp.watch(ES6_SRC, ['transpile']);
  gulp.watch(['sass/*.scss'], ['sass']);
});

gulp.task('deploy', function() {


  gulp.src(['css/**/*', 'src/**/*', 'images/**/*', 'bower_components/**/*'], { "base" : "." }).pipe(gulp.dest('dist'));

});

gulp.task('default', function(callback) {
  gulpSequence('clean', 'sass', 'transpile')(callback);
});
