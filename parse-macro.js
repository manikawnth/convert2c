var fs = require('fs');
var S = require('string');

var data = fs.readFileSync('PXLVAL00.txt',{encoding:'utf8'});

var lines = S(data).lines();

var linecount = 0;

/* macro processing variables */
var macro_xref_text = "Macro and Copy Code Cross Reference";
var macro_section_line = -1;
var macro_text = "-Macro";
var macro_line = -1;
var macro_done = false;
var macro_doc = {};

var dsect_xref_text = "Dsect Cross Reference";

for(i=0;i<lines.length;i++){
	line = lines[i];
	linecount ++;
	var str;
	var num;
	var pos;
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
			}
			else{
				// Format Macro name
				//----+----1----+----2----+----3----+----4----+----5
				//-Macro     Con  Called By        Defn  References
				// LTENT     L18  PRIMARY INPUT       -  9991
				if(line.search("PRIMARY INPUT") == 16){
					//If this is a 1st line of Macro and not continuation
					if( line.substr(1,1) !=' '){ 
							
							//Format macro_doc "name"
							str = S(line).trimLeft().s
							pos = str.search(' ')
							if(pos == -1){pos = str.length};
							macro_doc.name = line.substr(1,pos);	
							
							//Format macro_doc "stmt"
							str = S(line.substr(31,6)).trimLeft().s;
							if(str == '-'){macro_doc.stmt = -1;}
							else{macro_doc.stmt = S(str).toInt()}

							//Format macro_doc "ref" & isMacro"
							str_array = line.substr(39,line.length-39).split(", ");
							for(j=0;j<str_array.length;j++){
								str = str_array[j];
								var ref_array = [];
								if(S(str).endsWith('C')){
									num = S(S(str).between('','C').s).toInt()
									ref_array.push(num);
									macro_doc.isMacro = false;
								}
								else{
									num = S(S(str).s).toInt();
									ref_array.push(num);
									macro_doc.isMacro = true;
								}
							}
							macro_doc.ref = ref_array;
							console.log(macro_doc);
					}
					else{
						continue; //Logic to be added for big Macro names
					}
				}
				
			}
		}
	}
}

/*
function formatMacroDoc(i){
	/* 
	Dsect line Layout: 
	----+----1----+----2----+----3----+----4----+----5
	-Macro     Con  Called By        Defn  References
	0SAMPLE    L20  PRIMARY INPUT       -  3652   
	SAMP1      L20  SAMPLE              -  2731C     
	OTHER1     L17  PRIMARY INPUT       -  2731      
	CALL       L41  PRIMARY INPUT       -  2995, 3379   

	Macro doc layout
	{"name":"CALL","stmt":-1,"ref":[2995,3379],"isMacro":true}
	*/
/*
	var str = S(line[i]).collapseWhitespace().s;
	if(str.search(' ') )

}*/