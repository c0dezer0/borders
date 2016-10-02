var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var config = require('../../config.js')

module.exports = {
    getNews: function(req, res) {
    	try{
	        MongoClient.connect(config.db.url, function(err, db){
	        	if(!err){
	        		var collection = db.collection(config.db.collection);
	        		collection.find().sort({_id:-1}).toArray(function(err, data){
	        			if(!err){
	        				res.send(data);
	        				// var new_data = data.map(function(e){ delete e._id; return e;});
	        				// db.collection('old-news').insert(new_data, function(err){console.log(err);});
	        			}
	        			else{
	        				throw err;
	        			}
	        		});


	        	}
	        	else {
	        		throw err;
	        	}
	        })
	    }
	    catch(e){
	    	console.log(e);
	    	res.send({error: e});
	    }

    },
    detail: function(req, res) {
    	res.send("hotel details");
    },
    health: function(req, res){
    	res.send("Working!");
    }
}
