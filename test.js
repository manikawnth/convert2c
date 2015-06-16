var fs = require('fs');
fs.readFile('PXWRCHIP.txt',{encoding:'utf8'},function(err,data){
	console.log(data.substr(0,140));
})