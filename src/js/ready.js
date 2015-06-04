module.exports = function(fn) {
/* cordova */
  document.addEventListener('deviceready', fn);
/* /cordova */
/* web */
  window.onload = fn;
/* /web */
};
