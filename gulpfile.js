'use strict';

var gulp        = require('gulp');
var path        = require('./gulp-path.js');
var bump        = require('gulp-bump');
var exec        = require('gulp-exec');
var clean       = require('gulp-clean');
var gutil       = require('gulp-util');
var gulpif      = require('gulp-if');
var stylus      = require('gulp-stylus');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var rename      = require('gulp-rename');
var coffee      = require('gulp-coffee');
var header      = require('gulp-header');
var pkg         = require('./package.json');
// var notify      = require('gulp-notify');

var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

/////////
// VERSIONS
/////////

gulp.task('patch', function () {
  return gulp.src(path.pack).pipe(bump()).pipe(gulp.dest('./'));
});

gulp.task('minor', function() {
  return gulp.src(path.pack).pipe(bump({type:'minor'})).pipe(gulp.dest('./'));
});

gulp.task('major', function() {
  return gulp.src(path.pack).pipe(bump({type:'major'})).pipe(gulp.dest('./'));
});

gulp.task('tag', function () {
  var v = 'v' + pkg.version;
  var message = 'Release ' + v;

  console.log(gutil.colors.red('TODO'), 'for ' + pkg.version);
  console.log(gutil.colors.red("DON'T FORGET TO UPDATE README.md"));

  console.log('git ci -am "'+message+'"');

  console.log('git tag -a '+pkg.version+' -m "'+message+'"');
  console.log('git push origin master --tags');
  // console.log('npm publish');

  // return gulp.src('./')
  //   .pipe(git.commit(message, {args: '-a'}))
  //   .pipe(git.tag(v, message));
});

/////////
// ASSETS
/////////

gulp.task('clean-font', function() {
  return gulp.src(path.font.dst, {read: false}).pipe(clean());
});

gulp.task('font', ['clean-font'], function() {
  return gulp.src(path.font.src, {base: path.font.base})
    .pipe(gulp.dest(path.font.dst));
});

gulp.task('clean-lib', function() {
  return gulp.src(path.lib.dst + '/*.js', {read: false}).pipe(clean());
});

gulp.task('lib', ['clean-lib'], function() {
  gutil.log(gutil.colors.yellow('Don\'t forget to build ./bower_components/PointerGestures \n cd ./bower_components/PointerGestures && npm instal && grunt'));
  return gulp.src(path.lib.src)
    .pipe(gulp.dest(path.lib.dst));
});

// gulp.task('pointer-gestures', function() {
// Have to wait for gulp-exec support of cwd
// });

gulp.task('assets', ['lib', 'font']);

/////////
// CSS
/////////

gulp.task('clean-css', function() {
  return gulp.src(path.stylus.dst + '/hevent.css', {read: false}).pipe(clean());
});

gulp.task('stylus', ['clean-css'], function () {
  gulp.src(path.stylus.src)
    .pipe(stylus({
      use: [require('nib')(), require('hstrap')()],
      import: ['nib', 'hstrap'],
      urlFunc: ['embedurl'],
      set:['resolve url']
    }))
    .pipe(gulp.dest(path.stylus.dst))
});

/////////
// JS
/////////

gulp.task('build', ['clean-js'], function(){
  return gulp.src(path.plugin.src)
    .pipe(gulpif(/[.]coffee$/, coffee({join: true, bare: true})))
    .pipe(header(banner, { pkg : pkg } ))
    .pipe(concat('jquery.hevent.js'))
    .pipe(gulp.dest(path.plugin.dst))
    .pipe(uglify())
    .pipe(rename('jquery.hevent.min.js'))
    .pipe(gulp.dest(path.plugin.dst))
});

gulp.task('clean-js', function() {
  return gulp.src(path.lib.dst + '/*.js', {read: false}).pipe(clean());
});

/////////
// DOC
/////////

gulp.task('default', function() {
  console.log(gutil.colors.red('patch'), '  ', 'patch version of json');
  console.log(gutil.colors.red('minor'), '  ', 'minor version of json');
  console.log(gutil.colors.red('major'), '  ', 'major version of json');
  console.log(gutil.colors.red('assets'), ' ', 'Copy fonts & libs');
  console.log(gutil.colors.red('build'), '  ', 'Build plugin');
});
