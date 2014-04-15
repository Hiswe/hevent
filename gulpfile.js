'use strict';

var gulp        = require('gulp');
var bump        = require('gulp-bump');
var wait        = require('gulp-wait');
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
var notify      = require('gulp-notify');
// SERVER
var open        = require('gulp-open');
var lr          = require('tiny-lr')();
var open        = require('gulp-open');
var express     = require('express');
var connectLr   = require('connect-livereload');
var gulpLr      = require('gulp-livereload');
// CONFIG
var config      = require('./gulp-config.js');
var pkg         = require('./package.json');
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
  return gulp.src(config.pack).pipe(bump()).pipe(gulp.dest('./'));
});

gulp.task('minor', function() {
  return gulp.src(config.pack).pipe(bump({type:'minor'})).pipe(gulp.dest('./'));
});

gulp.task('major', function() {
  return gulp.src(config.pack).pipe(bump({type:'major'})).pipe(gulp.dest('./'));
});

gulp.task('tag', function () {
  var v = 'v' + pkg.version;
  var message = 'Release ' + v;

  console.log(gutil.colors.red('TODO'), 'for ' + pkg.version);
  console.log(gutil.colors.red("DON'T FORGET TO UPDATE README.md"));

  console.log('git ci -am "'+message+'"');

  console.log('git tag -a '+pkg.version+' -m "'+message+'"');
  console.log('git push origin master --tags');

  // return gulp.src('./')
  //   .pipe(git.commit(message, {args: '-a'}))
  //   .pipe(git.tag(v, message));
});

/////////
// ASSETS
/////////

gulp.task('clean-font', function() {
  return gulp.src(config.font.dst, {read: false}).pipe(clean());
});

gulp.task('font', ['clean-font'], function() {
  return gulp.src(config.font.src, {base: config.font.base})
    .pipe(gulp.dest(config.font.dst));
});

gulp.task('clean-lib', function() {
  return gulp.src(config.lib.dst + '/*.js', {read: false}).pipe(clean());
});

gulp.task('lib', ['clean-lib'], function() {
  var message = ['Don\'t forget to build ./bower_components/PointerGestures',
  'cd ./bower_components/PointerGestures && npm install && grunt'
  ].join('\n')
  gutil.log(gutil.colors.yellow(message));
  return gulp.src(config.lib.src)
    .pipe(gulp.dest(config.lib.dst));
});

// gulp.task('pointer-gestures', function() {
// Have to wait for gulp-exec support of cwd
// });

gulp.task('assets', ['lib', 'font']);

/////////
// CSS
/////////

gulp.task('clean-css', function() {
  return gulp.src(config.stylus.dst + '/hevent.css', {read: false}).pipe(clean());
});

gulp.task('stylus', ['clean-css'], function () {
  gulp.src(config.stylus.src)
    .pipe(stylus({
      use: [require('nib')(), require('hstrap')()],
      import: ['nib', 'hstrap'],
      urlFunc: ['embedurl'],
      set:['resolve url']
    }))
    .pipe(gulp.dest(config.stylus.dst))
    .pipe(gulpLr(lr))
    .pipe(notify({title: 'HEVENT', message: 'CSS build done'}))
});

/////////
// JS
/////////

gulp.task('build', ['clean-js'], function(){
  return gulp.src(config.plugin.src)
    .pipe(gulpif(/[.]coffee$/, coffee({join: true, bare: true})))
    .pipe(concat('jquery.hevent.js'))
    .pipe(header(banner, { pkg : pkg } ))
    .pipe(gulp.dest(config.plugin.dst))
    .pipe(uglify())
    .pipe(rename('jquery.hevent.min.js'))
    .pipe(header(banner, { pkg : pkg } ))
    .pipe(gulp.dest(config.plugin.dst))
    .pipe(gulpLr(lr))
    .pipe(notify({title: 'HEVENT', message: 'Plugin build done'}))
});

gulp.task('clean-js', function() {
  return gulp.src([config.plugin.dst + '/jquery.hevent*.js'], {read: false}).pipe(clean());
});

/////////
// SERVER
/////////

// WATCH
gulp.task('watch', function() {
  gulp.watch(['src/*.coffee'], ['build']);
  gulp.watch(['dist/hevent.styl'], ['stylus']);
  gulp.watch('./index.html').on('change', function(event) {
    gulp.src('').pipe(notify({title: 'HEVENT', message: 'reload html'}));
    lr.changed({body: {files: event.path}});
  });
});

// SERVER
var startExpress = function startExpress() {
  var app = express();
  app.use(connectLr());
  app.use(express.static(__dirname));
  app.listen(3000);
};

gulp.task('express', function(cb){
  startExpress();
  lr.listen(35729);
  cb();
});

gulp.task('server', ['express', 'watch']);

gulp.task("start", ['server'], function(){
  gulp.src('./README.md').pipe(wait(1000)).pipe(open('', {url: "http://localhost:3000"}));
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
  console.log(gutil.colors.red('start'), '  ', 'Demo tiny server with lr');
});
