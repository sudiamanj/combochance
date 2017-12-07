const babelify = require('babelify');
const bro = require('gulp-bro');
const concat = require('gulp-concat');
const del = require('del');
const gulp = require('gulp');
const insert = require('gulp-insert');
const rename = require('gulp-rename');
const uglifycss = require('gulp-uglifycss');

gulp.task('browserify', function () {
  return gulp.src('js/index.js')
    .pipe(bro({
      transform: [
        babelify.configure({ presets: ['env'] }),
        [ 'uglifyify', { global: true } ]
      ]
    }))
    .pipe(rename('bundle.min.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('concat-css', function () {
  return gulp.src(['node_modules/bootstrap/dist/css/bootstrap.min.css', 'node_modules/bootstrap/dist/css/bootstrap-theme.min.css', 'css/style.css'])
    .pipe(concat('bundle.min.css'))
    .pipe(uglifycss({
      'uglyComments': true
    }))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('copy-fonts', function () {
  return gulp.src('node_modules/bootstrap/dist/fonts/**/*')
    .pipe(gulp.dest('dist/fonts/'));
});

gulp.task('clean', function () {
  return del(['dist']);
});

gulp.task('es6ify-jquery-plugins', function () {
  return gulp.src(['js/3rdparty/detectmobilebrowser.js', 'node_modules/bootstrap/dist/js/bootstrap.min.js'])
    .pipe(concat('jqueryplugins.js'))
    .pipe(insert.prepend(`import jQuery from 'jquery'`))
    .pipe(gulp.dest('js/'));
});

gulp.task('default', ['browserify', 'concat-css', 'copy-fonts', 'es6ify-jquery-plugins']);
