var fs = require('fs');
var readline = require('readline');

var S = require('string');


var pgm_name = require('./convert-config.js').PGM_NAME;

var rl = readline.createInterface({
  input: fs.createReadStream( pgm_name + '.txt',{encoding:'utf8'})
});


var linecount = 0;

/* macro processing variables */
var macro_xref_text = "Macro and Copy Code Cross Reference";
var macro_section_line = -1;
var macro_text = "-Macro";
var macro_line = -1;
var macro_done = false;


/* dsect processing variables */
var dsect_xref_text = "Dsect Cross Reference";
var dsect_section_line = -1;
var dsect_text = "-Dsect";
var dsect_line = -1;
var dsect_done = false;

var reg_xref_text = "General Purpose Register Cross Reference";



rl.on('error',function(err){
	throw err;
})

rl.on('line',function(line){
	
	linecount++;
	/*
	if(!macro_done){
		//Find the label "Macro and Copy Code Cross Reference" and set the macro_section_line number 
		if(line.search(macro_xref_text) >= 0){
			macro_section_line = linecount;
		}

		// Find the label "-Macro", it should be at pos 0 and it should be next line of label "Macro and Copy Code Cross Reference" 
		if( (line.search(macro_text) >= 0) && 
			(line.indexOf(macro_text) == 0) && 
			(linecount-1 == macro_section_line) ){
			macro_line = linecount;
		}

		// If -Macro is already found and not on current line then process 
		if ( (macro_line >= 0) && (macro_line != linecount) ){
			if (( line.search(dsect_xref_text) >= 0 )){
				macro_done = true;
				//rl.close();
				updateDsectColl(dsect_array);
			}
			else{
				formatDsectDoc(line);
				
			}
		}
	}*/

	if(!dsect_done){
		/* Find the label "Dsect Cross Reference" and set the dsect_section_line number */
		if(line.search(dsect_xref_text) >= 0){
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
			if (( line.search(reg_xref_text) >= 0 )){
				dsect_done = true;
				rl.close();
				updateDsectColl(dsect_array);
			}
			else{
				formatDsectDoc(line);
				
			}
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



var macro_array = [];

function formatMacroDoc(line){
	/* 
	Dsect line Layout: 
	----+----1----+----2----+----3----+----4----+----5
	-Macro     Con  Called By        Defn  References
	0SAMPLE    L20  PRIMARY INPUT       -  3652   
	SAMP1      L20  SAMPLE              -  2731C     
	OTHER1     L17  PRIMARY INPUT       -  2731      
	CALL       L41  PRIMARY INPUT       -  2995, 3379   

	Macro doc layout
	{"name":"CALL","stmt":-1,ref":[2995,3379],"isMacro":true}
	*/
	var macro_doc = {};
	macro_doc.name = line.substr(1,8);
	macro_doc.stmt = S(S(line.substr(31,6)).trimLeft().s).toInt();
	macro_array.push(dsect_doc);

}


var dsect_array = [];

function formatDsectDoc(line){
	/* 
	Dsect line Layout: 
	----+----1----+----2----+----3----+-
	-Dsect     Length      Id       Defn
	0ALTPCB   00000014  FFFFFFF5   11551

	Dsect doc layout
	{"name":"TLSDSECT","stmt":11551}
	*/
	var dsect_doc = {};
	dsect_doc.name = line.substr(1,8);
	dsect_doc.stmt = S(S(line.substr(30,6)).trimLeft().s).toInt();
	dsect_array.push(dsect_doc);

}

