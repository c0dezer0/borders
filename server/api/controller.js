var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var config = require('../../config.js')
var pushNotify = require('../services/pushNotify.js');


module.exports = {
    getNews: function(req, res) {
        var page = Number(req.query.page) || 1;
        try {
            MongoClient.connect(config.db.url, function(err, db) {
                if (!err) {
                    var collection = db.collection(config.db.collection);
                    collection.find({ isVerified:true, isActive: true }).skip(10 * (page - 1)).limit(10).sort({ _id: -1 }).toArray(function(err, data) {
                        if (!err) {

                            data = data.map(function(news) {
                                news.api_url = (req.protocol) + '://' + req.headers.host + '/api/news/' + news._id;
                                return news;
                            });
                            res.send(data);
                            // var new_data = data.map(function(e){ delete e._id; return e;});
                            // db.collection('old-news').insert(new_data, function(err){console.log(err);});
                        } else {
                            throw err;
                        }
                        db.close();
                    });


                } else {
                    throw err;
                }
            });
        } catch (e) {
            console.log(e);
            res.send({ error: e });
        }

    },
    newsSearch: function(req, res) {
        console.log(req.headers.host);
        if (Object.keys(req.query).length) {
            try {
                if (req.query.id) {
                    req.query._id = ObjectId(req.query.id);
                    delete req.query.id;

                }
                var q = req.query;
                for (key in q) {
                    q[key] = { $regex: q[key], $options: 'i' };
                }
                q.isActive = true;
                console.log(q);
                MongoClient.connect(config.db.url, function(err, db) {
                    if (!err) {
                        var collection = db.collection(config.db.collection);
                        collection.find(q).toArray(function(err, data) {
                            if (!err) {
                                db.close();
                                data = data.map(function(news) {
                                    news.api_url = (req.protocol) + '://' + req.headers.host + '/api/news/' + news._id;
                                    return news;
                                });
                                res.send(data);
                            } else throw err;
                        });
                    } else throw err;
                });
            } catch (e) {
                console.log(e);
                res.send({ err: e });
            }
        }
    },
    getNewsDetails: function(req, res) {
        if (req.params.id) {
            var id = ObjectId(req.params.id);
            try {
                MongoClient.connect(config.db.url, function(err, db) {
                    if (!err) {
                        var collection = db.collection(config.db.collection);
                        collection.findOne({ _id: id }, function(err, data) {
                            if (!err) {
                                collection
                                    .aggregate([
                                        { $match: { url: data.url, isVerified:true } },
                                        { $group: { _id: "$body_full", publishedOn: { $last: "$publishedOn" }, date: { $last: "$date" } } }

                                    ])
                                    .toArray(function(err, list) {
                                        if (!err) {
                                            list = list.map(function(e) {
                                                e.text = e._id;
                                                delete e._id;
                                                return e;
                                            });
                                            data.timeline = list;
                                            delete data.body_full;
                                            db.close();
                                            res.send(data);
                                        } else throw err;
                                    });
                            } else throw err;
                        });
                    } else throw err;
                });
            } catch (e) {
                res.send({ err: e });
            }
        }
    },
    sendPushNotification: function(req, res) {
        var id = req.params.id;
        try {
            MongoClient.connect(config.db.url, function(err, db) {
                if (!err) {
                    var collection = db.collection(config.db.collection);
                    collection.findOne({ _id: ObjectId(id)}, function(err, data) {
                        if (!err) {
                            if(!data.pushNotify)
                                pushNotify('news', data.title, data.body, function(err, response) {
                                    res.send({ error: err, body: response });
                                    if(!err){
                                    	collection.update({ _id: ObjectId(id) }, { $set: { pushNotify: true , isVerified:true, isActive:true } });
                                    }
                                });
                        }
                        else throw err;
                    });
                }
                else throw err;
            });
        }
        catch(e){
        	res.send({error: e});
        }


        //res.send("hotel details");
    },
    publishNews: function(req, res){
        var id = req.params.id;
        try {
            MongoClient.connect(config.db.url, function(err, db) {
                if (!err) {
                    var collection = db.collection(config.db.collection);
                    collection.update({_id: ObjectId(id)}, {$set:{isVerified:true, isActive:true}}, function(err){
                        if(!err){
                            res.send({error:false});
                        }
                        else throw err;
                    })
                }
                else throw err;
            });
        }
        catch(e){
            res.send({error: e});
        }
    },
    unpublishNews: function(req, res){
        var id = req.params.id;
        try {
            MongoClient.connect(config.db.url, function(err, db) {
                if (!err) {
                    var collection = db.collection(config.db.collection);
                    collection.update({_id: ObjectId(id)}, {$set:{isVerified:true, isActive:false}}, function(err){
                        if(!err){
                            res.send({error:false});
                        }
                        else throw err;
                    })
                }
                else throw err;
            });
        }
        catch(e){
            res.send({error: e});
        }
    },
    adminNews: function(req, res){
        try {
            MongoClient.connect(config.db.url, function(err, db) {
                if (!err) {
                    var collection = db.collection(config.db.collection);
                    collection.find({isVerified:false}).limit(1).sort({_id:-1}).toArray(function(err, data){
                        if(!err){
                            var obj={};
                            obj.data = data;
                            collection.count({isVerified:false}, function(err, count){
                                obj.count= count;
                                res.send(obj);
                            });
                        }
                        else throw err;

                    });
                }
                else throw err;
            });
        }
        catch(e){
            res.send({error: e});
        }
    },
    deleteNews: function(req, res) {
        res.send("delete news")
    },
    health: function(req, res) {
        res.send("health is up!");
    }
}
