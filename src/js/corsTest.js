module.exports = function() {
  var req = new XMLHttpRequest();
  req.open('GET', 'https://api.github.com', true);

  req.onreadystatechange = function () {
    if (req.readyState === 4) {
      console.log('response=', req.responseText);
    }
  };

  req.send();
};
