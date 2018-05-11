/**
 * @license
 * Copyright (c) 2018, General Electric
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
const { ensureLicense } = require('ensure-px-license');

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
    .pipe(ensureLicense())
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

gulp.task('license', function() {
  return gulp.src(['./**/*.{html,js,css,scss}', '!./node_modules/**/*', '!./bower_components?(-1.x)/**/*'])
    .pipe(ensureLicense())
    .pipe(gulp.dest('.'));
});

gulp.task('default', function(callback) {
  gulpSequence('clean', 'sass', 'transpile', 'license')(callback);
});
