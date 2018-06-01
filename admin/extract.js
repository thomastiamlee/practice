const fs = require('fs');

const characters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

function generatePassword() {
  var res = '';
  while (res.length != 6) {
    var rand = characters[Math.floor(Math.random() * characters.length)];
    res += rand;
  }
  return res;
}

var adaptive = fs.readFileSync('adaptive_list.txt', 'utf-8').split(',');
var plain = fs.readFileSync('plain_list.txt', 'utf-8').split(',');
adaptive.sort();
plain.sort();

var adaptiveRes = '';
var plainRes = '';

for (var i = 0; i < adaptive.length; i++) {
  var current = adaptive[i];
  if (current.trim() == '') continue;
  adaptiveRes += 'b' + current + '@fun.ac.jp' + ' ' + generatePassword() + '\n';
}

for (var i = 0; i < plain.length; i++) {
  var current = plain[i];
  if (current.trim() == '') continue;
  plainRes += 'b' + current + '@fun.ac.jp' + ' ' + generatePassword() + '\n';
}

fs.writeFileSync('./adaptive_extracted.txt', adaptiveRes, 'utf-8');
fs.writeFileSync('./plain_extracted.txt', plainRes, 'utf-8');
