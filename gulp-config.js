exports.pack = [
  './package.json',
  './bower.json'
];

// Src are in the same order as in ex-gruntfile
exports.plugin = {
  src: [
    'src/jquery.hclass.coffee',
    'src/jquery.htransanimation.coffee'
  ],
  dst: 'build'
};

exports.font = {
  src: 'bower_components/hiso-font/font/*',
  base: './bower_components/hiso-font/font',
  dst: 'dist/font'
};

exports.stylus = {
  src: 'dist/hevent.styl',
  dst: 'dist'
};

exports.lib = {
  src: [
    'bower_components/pointerevents-polyfill/pointerevents.min.js',
    'bower_components/modernizr/modernizr.js',
    'bower_components/PointerGestures/pointergestures.min.js',
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/jquery-pointer-events/src/pointer.js'
  ],
  dst: 'dist/lib'
};
