# convert2c

Assembler Compile Options:

-> MXREF(FULL)
-> XREF(FULL)
-> LINECOUNT(0)


Metadata in mongodb:
{
	"_id":ObjectId("557e1253f6322e728067b2e3"),
	"program":"PXWRCHIP",
	"code":[{"stmt":234,"code":"MVC 0(4,R2),VAR1","type":"code/data","isMacro":boolean,"isCopy":boolean},{},{},{}],
	"dsects":[{"name":"TLSDSECT","stmt":11551},{},{}]

}


All configurations are present in  "convert-config.js"

Logic:
Spawn different processes to
	1. Get dsects
	2. Get Macros
	3. Then code lines

