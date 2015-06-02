var fs = require('fs');
var packageJson = require('../package.json');

module.exports = function (context) {
  console.log('Synchronizing plugins with package.json');

  var oldPlugins = packageJson.cordovaPlugins;
  packageJson.cordovaPlugins = context.opts.cordova.plugins;
  console.log('synchronizing package.json from', oldPlugins, 'to', packageJson.cordovaPlugins);

  fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
};
