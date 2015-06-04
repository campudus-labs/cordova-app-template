var someCorsTest = require('./corsTest.js');

require('./ready')(main);

function main() {

  console.log('coding here!!');

  document.getElementById('cors-button').onclick = someCorsTest;

}
