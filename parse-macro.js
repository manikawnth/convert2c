var fs = require('fs');
var S = require('string');

var data = fs.readFileSync('PXLVAL00.txt',{encoding:'utf8'});

var lines = S(data).lines();

var linecount = 0;


// ---------------------------------------------------------------------------------------------------- //
// source processing variables - Global data                                                            //
// ---------------------------------------------------------------------------------------------------- //
var source_xref_text = "Source Statement";
var source_section_line = -1;
//var source_text = "-Symbol";
var source_line = -1;
var source_done = false;

var source_array = [];


// ---------------------------------------------------------------------------------------------------- //
// relocation  processing variables - Global data                                                       //
// ---------------------------------------------------------------------------------------------------- //
var reloc_xref_text = "Relocation Dictionary";



// ---------------------------------------------------------------------------------------------------- //
// symbol processing variables - Global data                                                             //
// ---------------------------------------------------------------------------------------------------- //
var symbol_xref_text = "Ordinary Symbol and Literal Cross Reference";
var symbol_section_line = -1;
var symbol_text = "-Symbol";
var symbol_line = -1;
var symbol_done = false;

var symbol_array = [];


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
var nolabel;

for(i=0;i<lines.length;i++){
	line = lines[i];
	linecount ++;

	if(!source_done){
	
		//----+----1----+----2----+----3----+----4----+----5----+----6
		//-  Loc  Object Code    Addr1 Addr2  Stmt   Source Statement 
		//0                                      1 *******************
	    //	                                  	 2 ********PRECOMP    

		//Find the label "Source Statement" and set the source_section_line number 
		if(line.search(source_xref_text) >= 0){
			source_section_line = linecount;
		}

		if(source_section_line > 0 && source_section_line!= linecount){
			if(line.search(reloc_xref_text) >= 0 ){
				source_done = true;
			}
			else{
				//Line is an open-source statement and not a comment.
				if(line.substr(40,1) == ' ' && line.substr(41,1) != '*' && line.substr(41,2) != '.*'){
					var str = line.substr(41,line.length - 41);
					var source_doc = {};
					nolabel = false;
					
					source_doc.disp = line.substr(1,6);
					source_doc.machinecode = S(line.substr(8,9).trimRight()).s;
					source_doc.stmt = S(S(line.substr(35,5)).trimLeft().s).toInt();
					
					if(str.substr(1,1) == ' '){ 
						nolabel = true;
					}

					str_array = S(str).collapseWhitespace().s.split(" ");
					if(nolabel){
						source_doc.label = '';
						source_doc.opcode = str_array[0];
						source_doc.operands = str_array[1];
					}
					else{
						source_doc.label = str_array[0];
						source_doc.opcode = str_array[1];
						source_doc.operands = str_array[2];
					}
					source_array.push(source_doc);
				}
			}
		}

	}


	if(!symbol_done){

		//Find the label "Ordinary Symbol and Literal Cross Reference" and set the symbol_section_line number 
		if(line.search(symbol_xref_text) >= 0){
			symbol_section_line = linecount;
		}

		// Find the label "-Symbol", it should be at pos 0 and it should be next line of label "Ordinary Symbol and Literal Cross Reference" 
		if( (line.search(symbol_text) >= 0) && 
			(line.indexOf(symbol_text) == 0) && 
			(linecount-1 == symbol_section_line) ){
			symbol_line = linecount;
		}

		// If -Symbol is already found and not on current line then process 
		if ( (symbol_line >= 0) && (symbol_line != linecount) ){
			if (( line.search(macro_xref_text) >= 0 )){
				symbol_done = true;
			}
			else{
				//Variables needed for every iteration
				var symbol_doc = {};
				var ref_array = [];
				
				// Format Symbol name
				//----+----1----+----2----+----3----+----4----+----5----+----6----+----7--
				//-Symbol   Length   Value     Id    R Type Asm  Program   Defn References
				//0$LK0004       1 000001B2 00000002     U                 3472           
				// $LK0004A      1 000001C2 00000002     U                 3478  3496B    
				
				if (line.substr(1,1) != ' '){  //If the line has Symbol name
					// If 8th char is not space, then there is a continuation
					// Only "name" is pushed into symbol document array
					str = S(line).trimLeft().s
					pos = str.search(' ')
					if(pos == -1){
						pos = str.length
						symbol_doc.name = line.substr(1,pos);
						symbol_array.push(symbol_doc);
						continue;		//Continue for next line
					}
					else{
						// The line has name, stmt till ref
						symbol_doc.name = line.substr(1,pos);
						symbol_doc.stmt = S(S(line.substr(55,6)).trimLeft().s).toInt();
						symbol_doc.len = S(S(line.substr(10,6)).trimLeft().s).toInt();
						symbol_doc.typeattr = line.substr(39,1);
						symbol_doc.datatype = line.substr(42,1);

						str_array = S(S(line.substr(62,line.length-62)).trimLeft().s).collapseWhitespace().s.split(" ");
		
						for(j=0;j<str_array.length;j++){
							str = str_array[j];
							var ref_doc = {};

							switch(str[str.length - 1]){
								case 'B':
									ref_doc.reftype = 'B';
									ref_doc.stmt = str.substr(0,str.length -1);
									break;
								case 'D':
									ref_doc.reftype = 'D';
									ref_doc.stmt = str.substr(0,str.length -1);
									break;
								case 'M':
									ref_doc.reftype = 'M';
									ref_doc.stmt = str.substr(0,str.length -1);
									break;
								case 'U':
									ref_doc.reftype = 'U';
									ref_doc.stmt = str.substr(0,str.length -1);
									break;
								case 'X':
									ref_doc.reftype = 'X';
									ref_doc.stmt = str.substr(0,str.length -1);
									break;
								default:
									ref_doc.reftype = ' ';
									ref_doc.stmt = str.substr(0,str.length);
									break;
							}
							ref_array.push(ref_doc);
							symbol_doc.ref = ref_array;

						}
						symbol_array.push(symbol_doc);
					}
				}
				else{
					//This is continuation of previous line
					//Point macr_doc to last element of the macro_array for continuation lines
					symbol_doc = symbol_array[symbol_array.length - 1];
					if(line.substr(15,1) == ' '){
						//Previouls line has only name, type and some refs
						str_array = S(S(line.substr(62,line.length-62)).trimLeft().s).collapseWhitespace().s.split(" ");
						for(j=0;j<str_array.length;j++){
							str = str_array[j];
							var ref_doc = {};

							switch(str[str.length - 1]){
								case 'B':
									ref_doc.reftype = 'B';
									ref_doc.stmt = str.substr(0,str.length -1);
									break;
								case 'D':
									ref_doc.reftype = 'D';
									ref_doc.stmt = str.substr(0,str.length -1);
									break;
								case 'M':
									ref_doc.reftype = 'M';
									ref_doc.stmt = str.substr(0,str.length -1);
									break;
								case 'U':
									ref_doc.reftype = 'U';
									ref_doc.stmt = str.substr(0,str.length -1);
									break;
								case 'X':
									ref_doc.reftype = 'X';
									ref_doc.stmt = str.substr(0,str.length -1);
									break;
								default:
									ref_doc.reftype = ' ';
									ref_doc.stmt = str.substr(0,str.length);
									break;
							}
							symbol_doc.ref.push(ref_doc);

						}
					}
					else{
						//Previous line has only name and nothing else
						symbol_doc.name = line.substr(1,pos);
						symbol_doc.stmt = S(S(line.substr(55,6)).trimLeft().s).toInt();
						symbol_doc.len = S(S(line.substr(10,6)).trimLeft().s).toInt();
						symbol_doc.typeattr = line.substr(39,1);
						symbol_doc.datatype = line.substr(42,1);

						str_array = S(S(line.substr(62,line.length-62)).trimLeft().s).collapseWhitespace().s.split(" ");
		
						for(j=0;j<str_array.length;j++){
							str = str_array[j];
							var ref_doc = {};

							switch(str[str.length - 1]){
								case 'B':
									ref_doc.reftype = 'B';
									ref_doc.stmt = str.substr(0,str.length -1);
									break;
								case 'D':
									ref_doc.reftype = 'D';
									ref_doc.stmt = str.substr(0,str.length -1);
									break;
								case 'M':
									ref_doc.reftype = 'M';
									ref_doc.stmt = str.substr(0,str.length -1);
									break;
								case 'U':
									ref_doc.reftype = 'U';
									ref_doc.stmt = str.substr(0,str.length -1);
									break;
								case 'X':
									ref_doc.reftype = 'X';
									ref_doc.stmt = str.substr(0,str.length -1);
									break;
								default:
									ref_doc.reftype = ' ';
									ref_doc.stmt = str.substr(0,str.length);
									break;
							}
							ref_array.push(ref_doc);
						}
						symbol_doc.ref = ref_array;
					}
				}
			}
		}
	}
 

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
				
				//If this is a long name line
				if((S(line).trimLeft().s).search(' ') == -1){
					debugger;
					macro_doc.name = line.substr(1,line.length - 1);
					macro_array.push(macro_doc);
				}

				if(line.search("PRIMARY INPUT") == 16){

					//If this is a 1st line of Macro and not continuation
					if( line.substr(1,1) !=' '){ 
							//Format macro_doc "name"
							str = S(line).trimLeft().s;
							pos = str.search(' ');
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
						//Point macr_doc to last element of the macro_array for continuation lines
						macro_doc = macro_array[macro_array.length - 1];

						if(line.substr(36,1) == ' '){
							//Format macro_doc "ref" for continuation lines
							for(j=0;j<str_array.length;j++){
								
								str_array = line.substr(39,line.length-39).split(", ");
								str = str_array[j];

								num = S(S(str).s).toInt();
								macro_doc.ref.push(num);
								macro_doc.isMacro = true;

							}
						}
						
						else{

							//Format macro_doc "stmt"
							debugger;
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
						}	
						
					}
				}
				
			}
		}
	}


	if(!dsect_done){
		if(line.search(dsect_xref_text) >= 0){
			dsect_section_line = linecount;
		}

		// Find the label "-Dsect", it should be at pos 0 and it should be next line of label "Dsect Cross Reference" 
		if( (line.search(dsect_text) >= 0) && 
			(line.indexOf(dsect_text) == 0) && 
			(linecount-1 == dsect_section_line) ){
			dsect_line = linecount;
		}

		// If -Dsect is already found and not on current line then process 
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



/*
for(k=3000;k<3000 + 35;k++){
	console.log(JSON.stringify(source_array[k],null,4));
}
*/

console.log(source_array);
//console.log(dsect_array);