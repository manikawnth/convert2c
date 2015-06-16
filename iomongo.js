var mongoclient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";

exports.update = function(){mongoclient.connect(url,function(err,db){
	if(err){throw err}
		

})
}
