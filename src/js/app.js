var someCorsTest = require('./corsTest.js');

document.addEventListener('deviceready', main);

function main() {

  console.log('coding here!!');

  document.getElementById('cors-button').onclick = someCorsTest;
}
