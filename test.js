var fs = require('fs');
var S = require('string');

var line = " LTENT     L18  PRIMARY INPUT       -  9991, 9994, 9998, 10002, 10006, 10010, 10014, 10018, 10022, 10026, 10030, 10034";

console.log(S(line).collapseWhitespace().s);