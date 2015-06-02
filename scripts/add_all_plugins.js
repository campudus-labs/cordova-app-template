var cordova = require('cordova');
var packageJson = require('../package.json');

var plugins = (packageJson.cordovaPlugins || []);
console.log('Installing plugins', plugins);

plugins.forEach(function (plugin) {
  console.log('Installing plugin', plugin);
  cordova.plugin('add', plugin);
});
