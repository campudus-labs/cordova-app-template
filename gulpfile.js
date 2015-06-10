var gulp = require('gulp');
var Path = require('path');
var compass = require('gulp-compass');
var minifyCss = require('gulp-minify-css');
var del = require('del');
var browserify = require('browserify');
var shell = require('gulp-shell');
var liveReload = require('gulp-livereload');
var browserSync = require('browser-sync');
var plumber = require('gulp-plumber');
var corsProxy = require('cors-anywhere');
var internalIp = require('internal-ip');
var source = require('vinyl-source-stream');
var through = require('through');
var gulpSequence = require('gulp-sequence');

var cordovaMode = false;
var webMode = false;
var watchAll = false;

var settings = {
  corsProxyHost : internalIp(),
  corsProxyPort : 1234
};

gulp.task('sass', sassCompile);
gulp.task('assets', assetCopy);
gulp.task('scripts', browserifyScripts);
gulp.task('clean', clean);

gulp.task('build:cordova', function (cb) {
  gulpSequence('env:cordova', ['assets', 'sass', 'scripts'], cb);
});
gulp.task('prepare:cordova', ['build:cordova'], cordovaPrepare);
gulp.task('build:web', function (cb) {
  gulpSequence('env:web', ['assets', 'sass', 'scripts'], cb);
});

gulp.task('reload:cordova', ['prepare:cordova'], cordovaReload);
gulp.task('reload:web', ['build:web'], browserSync.reload);
gulp.task('reload', function (cb) {
  gulpSequence('reload:cordova', 'reload:web', cb);
});

gulp.task('env:cordova', envSetupCordova);
gulp.task('env:web', envSetupWeb);

gulp.task('setup-livereload:cordova', ['build:cordova'], liveReloadCordova);
gulp.task('setup-livereload:web', ['build:web'], liveReloadWeb);
gulp.task('setup-livereload', function (cb) {
  gulpSequence('setup-livereload:cordova', 'setup-livereload:web', cb);
});

gulp.task('dev:cordova', ['setup-livereload:cordova'], setupWatcher(['reload:cordova']));
gulp.task('dev:web', ['setup-livereload:web'], setupWatcher(['reload:web']));

gulp.task('dev', ['setup-livereload'], setupWatcher(['reload']));

gulp.task('default', function(cb) {
  gulpSequence('build:cordova', 'build:web', cb);
});

function envSetupWeb(cb) {
  webMode = true;
  cordovaMode = false;
  cb();
}

function envSetupCordova(cb) {
  cordovaMode = true;
  webMode = false;
  process.env['SERVER_HOST'] = internalIp();
  process.env['SERVER_PORT'] = 3000;
  process.env['LIVERELOAD_PORT'] = 35729;
  cb();
}

function sassCompile() {
  return gulp.src('src/scss/style.scss')
    .pipe(plumber({
      errorHandler : function (error) {
        console.log('error!', error);
        this.emit('end');
      }
    }))
    .pipe(compass({
      project : Path.join(__dirname),
      css : 'tmp/css',
      sass : 'src/scss',
      image : 'src/img'
    }))
    .pipe(minifyCss())
    .pipe(destination('/css'));
}

function browserifyScripts() {
  return browserify('./src/js/app.js')
    .transform('browserify-shim')
    .transform(function (file) {
      var data = '';
      if (/ready.js$/.test(file)) {
        return through(write, useByEnvironment);
      }
      return through();

      function write(buf) {
        data += buf;
      }

      function useByEnvironment() {
        if (!cordovaMode) {
          data = data.replace(/\/\* cordova \*\/[\s\S]*?\/\* \/cordova \*\//, '');
        }
        if (!webMode) {
          data = data.replace(/\/\* web \*\/[\s\S]*?\/\* \/web \*\//, '');
        }
        this.queue(data);
        this.queue(null);
      }
    })
    .transform(function (file) {
      var data = '';
      if (cordovaMode) {
        if (/\.html$/.test(file)) {
          return through(write, replaceSettings);
        }
      }
      return through();

      function write(buf) {
        data += buf;
      }

      function replaceSettings() {
        var d = data.replace(/(\s*["']?domain["']?\s*:\s*["'])(.*)(["']\s*)/m,
          '$1http://' + settings.corsProxyHost + ':' + settings.corsProxyPort + '/$2$3');
        this.queue(d);
        this.queue(null);
      }
    })
    .bundle()
    .on('error', function (err) {
      console.log('error occured:', err);
      this.emit('end');
    })
    .pipe(source('app.js'))
    .pipe(destination('/js'));
}

function assetCopy() {
  return gulp.src(['src/**', '!src/js/**', '!src/scss/**'])
    .pipe(through(function (file) {
      var data;
      if (/\.html$/.test(file.path)) {
        data = file.contents.toString().replace(/<!-- EMBED_CSP_POLICY -->/, embedContentSecurityPolicyText());
        data = data.replace(/<!-- EMBED_CORDOVA -->/, embedCordovaScript());
        file.contents = new Buffer(data);
      }
      return this.queue(file);
    }))
    .pipe(destination('/'));
}

function embedCordovaScript() {
  if (cordovaMode) {
    return '<script src="cordova.js"></script>';
  } else {
    return '';
  }
}

function embedContentSecurityPolicyText() {
  if (cordovaMode) {
    return '<meta http-equiv="Content-Security-Policy" content="default-src \'self\' ' + process.env['SERVER_HOST'] +
      ':* ws://' + process.env['SERVER_HOST'] + ':' +
      process.env['LIVERELOAD_PORT'] + ' *; style-src \'self\' \'unsafe-inline\'; media-src *">';
  } else {
    return '';
  }
}

function setupWatcher(which) {
  return function () {
    console.log('watching', which);
    gulp.watch(['src/**'], which);
  };
}

function liveReloadWeb(cb) {
  browserSync({
    server : {
      baseDir : 'www-web'
    },
    open : false
  });

  cb();
}

function liveReloadCordova(cb) {
  liveReload.listen();

  corsProxy.createServer({
    requireHeader : ['origin', 'x-requested-with'],
    removeHeaders : ['cookie', 'cookie2']
  }).listen(settings.corsProxyPort, settings.corsProxyHost, function () {
    console.log('Running CORS Anywhere on ' + settings.corsProxyHost + ':' + settings.corsProxyPort);
    cb();
  });
}

function cordovaPrepare() {
  return gulp.src('')
    .pipe(plumber())
    .pipe(shell(['cordova prepare']));
}

function cordovaReload() {
  return gulp.src('')
    .pipe(plumber())
    .pipe(liveReload());
}

// clean Task
function clean(cb) {
  del(['www/**', 'www-web/**', 'tmp/**'], cb);
}

function destination(path) {
  var stream;
  if (cordovaMode) {
    stream = gulp.dest('www' + path);
  }
  if (webMode) {
    console.log('writing ' + path + ' into www-web');
    if (!stream) {
      stream = gulp.dest('www-web' + path);
    } else {
      stream = stream.pipe(gulp.dest('www-web' + path));
    }
  }
  return stream;
}
