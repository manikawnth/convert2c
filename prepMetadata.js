
var S = require('string');

exports.prepMetadata = function(line){
	
	isCode(line);

}





/* Check the line of the listing and determine if it is a code statement or not */
/* Example line below:
0                                    211=         GBLC  &AIRPRTR
*/

function isCode(line){
	

	
	if(line.length >= 40){

		var stmt = line.substr(34,6);
		
		if (stmt == "      "){ return false };

		stmt = S(stmt).trimLeft().s;
		return(isNaN(stmt));
	
	}
	return false;


	
}