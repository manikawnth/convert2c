var fs = require('fs');
var readline = require('readline');

var S = require('string');


var pgm_name = require('./convert-config.js').PGM_NAME;

var rl = readline.createInterface({
  input: fs.createReadStream( pgm_name + '.txt',{encoding:'utf8'})
});


var linecount = 0;

var dsect_section_text = "Dsect Cross Reference";
var dsect_section_line = -1;
var dsect_text = "-Dsect";
var dsect_line = -1;

var closing_text = "General Purpose Register Cross Reference";



rl.on('error',function(err){
	throw err;
})

rl.on('line',function(line){
	
	linecount++;

	
	/* Find the label "Dsect Cross Reference" and set the dsect_section_line number */
	if(line.search(dsect_section_text) >= 0){
		dsect_section_line = linecount;
	}

	/* Find the label "-Dsect", it should be at pos 0 and it should be next line of label "Dsect Cross Reference" */
	if( (line.search(dsect_text) >= 0) && 
		(line.indexOf(dsect_text) == 0) && 
		(linecount-1 == dsect_section_line) ){
		dsect_line = linecount;
	}

	/* If -Dsect is already found and not on current line then process */
	if ( (dsect_line >= 0) && (dsect_line != linecount) ){
		if (( line.search(closing_text) >= 0 )){
			rl.close();
			updateDsectColl(dsect_array);
		}
		else{
			formatDsectDoc(line);
			
		}
	}

})


rl.on('close',function(){
	console.log("File ended");
	console.log(dsect_array);
	var dsect_array_doc = {};
	dsect_array_doc.dsects = dsect_array;
	fs.writeFileSync('dsect_meta.txt',JSON.stringify(dsect_array_doc));
	
	process.exit(0);
	
})



/* 
Dsect line Layout: 
----+----1----+----2----+----3----+-
-Dsect     Length      Id       Defn
0ALTPCB   00000014  FFFFFFF5   11551

Dsect doc array layout
[{"name":"TLSDSECT","stmt":11551},{},{}]
*/
var dsect_array = [];

function formatDsectDoc(line){
	var dsect_doc = {};
	dsect_doc.name = line.substr(1,8);
	dsect_doc.stmt = S(S(line.substr(31,6)).trimLeft().s).toInt();
	dsect_array.push(dsect_doc);

}




/* Mongo db (convert) collection (programs) documents layout
program is uniquely indexed.
{
	"_id":ObjectId("557e1253f6322e728067b2e3"),
	"program":"PXWRCHIP",
	"code":[{"stmt":234,"code":"MVC 0(4,R2),VAR1","type":"code/data","isMacro":boolean,"isCopy":boolean},{},{},{}],
	"dsects":[{"name":"TLSDSECT","stmt":11551},{},{}]

}
*/
/*
function updateDsectColl(dsect_array){
	console.log(dsect_array);

	var mongoclient = require('mongodb').MongoClient;
	var url = require('./convert-config.js').MONGO_URL;
	var coll = require('./convert-config.js').MONGO_COLL;
	

	mongoclient.connect(url,function(err,db){
		if (err) throw err;
		db.collection(coll).find({"program":pgm_name}).toArray(function(err,docArray){
			if(err){ throw err}
			if(docArray.length == 0){
				console.log(pgm_name);
				console.log(dsect_array);
				db.collection(coll).insert({"program":pgm_name},function(err,result){
					if(err) throw err;
					console.log(result);
					
				});
			}
			/*
			db.collection(coll).update({"program":pgm_name},{"dsects":dsect_array},function(err,result){
				if(err) throw err;
				console.log(result);
			});
*/
/*		});
	})


}
*/