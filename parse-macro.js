var fs = require('fs');
var S = require('string');

var data = fs.readFileSync('PXLVAL00.txt',{encoding:'utf8'});

var lines = S(data).lines();

var linecount = 0;

// ---------------------------------------------------------------------------------------------------- //
// macro processing variables - Global data                                                             //
// ---------------------------------------------------------------------------------------------------- //
var macro_xref_text = "Macro and Copy Code Cross Reference";
var macro_section_line = -1;
var macro_text = "-Macro";
var macro_line = -1;
var macro_done = false;

var macro_array = [];

// ---------------------------------------------------------------------------------------------------- //
// dsect processing variables - Global data                                                             //
// ---------------------------------------------------------------------------------------------------- //
var dsect_xref_text = "Dsect Cross Reference";
var dsect_section_line = -1;
var dsect_text = "-Dsect";
var dsect_line = -1;
var dsect_done = false;

var dsect_array = [];

// ---------------------------------------------------------------------------------------------------- //
// register processing variables - Global data                                                          //
// ---------------------------------------------------------------------------------------------------- //
var reg_xref_text = "General Purpose Register Cross Reference";

//Temporary Work variables
var str;
var num;
var pos;

for(i=0;i<lines.length;i++){
	line = lines[i];
	linecount ++;



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
				//Variables needed for every iteration
				var macro_doc = {};
				var ref_array = [];
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
							macro_array.push(macro_doc);
					}
					else{ 
						debugger;
						if(line.substr(36,1) == ' '){
							//Point macr_doc to last element of the macro_array for continuation lines
							macro_doc = macro_array[macro_array.length - 1];

							//Format macro_doc "ref" for continuation lines
							for(j=0;j<str_array.length;j++){
								
								str_array = line.substr(39,line.length-39).split(", ");
								str = str_array[j];

								num = S(S(str).s).toInt();
								macro_doc.ref.push(num);
								macro_doc.isMacro = true;

							}
						}; 	
						//continue; //Logic to be added for big Macro names
					}
				}
				
			}
		}
	}


	if(!dsect_done){
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
			}
			else{
				//Variables needed for every iteration
				var dsect_doc = {};
				dsect_doc.name = line.substr(1,8);
				dsect_doc.stmt = S(S(line.substr(30,6)).trimLeft().s).toInt();
				dsect_array.push(dsect_doc);
				
			}
		}
	}
}

console.log(macro_array);
console.log(dsect_array);