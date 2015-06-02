var fs = require('fs');
var ip = require('internal-ip')();

module.exports = function (context) {
  context.opts.paths.forEach(function (path) {
    replaceGapReload(path + '/gapreload.xml');
  });
};

function replaceGapReload(apiFile) {
  if (fs.existsSync(apiFile)) {
    replacer(apiFile, [
      {regex : /\$SERVER_HOST/, subs : ip},
      {regex : /\$SERVER_PORT/, subs : 8000},
      {regex : /\$LIVERELOAD_HOST/, subs : ip},
      {regex : /\$LIVERELOAD_PORT/, subs : 35729}
    ]);
  }
}

function replacer(fileName, opts) {
  var data = fs.readFileSync(fileName, 'utf8');
  opts.forEach(function (elem) {
    data = data.replace(elem.regex, elem.subs);
  });
  fs.writeFileSync(fileName, data);
}
