var fs = require('fs');
var lineByLine = require('line-by-line');
var lr = new lineByLine('test.txt',{encoding:'utf8',skipEmptyLines: true});

var linecount = 0;


lr.on('error',function(err){
	throw err;
})

lr.on('line',function(line){
	require('./prepMetadata.js').prepMetadata(line);
})

lr.on('end',function(){
	console.log("File ended");
})
