var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');
var config = require('../../../config.js');
var MongoClient = require('mongodb').MongoClient;

var URL = "http://timesofindia.indiatimes.com";

String.prototype.sanitize = function() {
    var x = this.replace(/\s\s+/g, '');
    x = x.replace(/\n/gi, '');
    x = x.replace(/\'s/gi, "'s");
    x = x.replace(/\'/gi, "");
    x = x.replace(/+/g,'');
    return x;
}
var getDetails = function(data, $) {
    var obj = {};
    obj.title = "" + $(data).text().sanitize();
    obj.url = $(data).find('a').attr('href')[0] == '/' ? (URL + $(data).find('a').attr('href')) : $(data).find('a').attr('href');
    obj.source = "toi";

    request(obj.url, function(err, status, body) {
        if (!err) {
            try {
                fs.writeFile(__dirname + '/' + obj.title + '.html', body, (err) => { console.log(err); });
                var $ = cheerio.load(body);
                obj.title_full = "" + (obj.url.indexOf('blog') >= 0 ? $('h2').text().sanitize() : $('.heading1').text().sanitize());
                obj.body_full = "" + (obj.url.indexOf('blog') >= 0 ? $('.content').text().sanitize() : $('.section1').text().sanitize());

                obj.media = {
                    type: '' + (obj.url.indexOf('blog') >= 0 ? '' : 'IMG'),
                    src: (obj.url.indexOf('blog') >= 0 ? '' : (URL + $('.highlight img').attr('src')))

                }

                obj.publishedOn = (obj.url.indexOf('blog') >= 0 ? $('.date').text() : $('.time_cptn span').text().replace("Updated: ", ""));
                // console.log(obj);
                // MongoClient.connect(config.db.url, function(error, db) {
                //     if (!error) {
                //         var collection = db.collection(config.db.collection);
                //         collection.count({ url: obj.url }, function(e, c) {

                //             if (!c) {
                                
                //                 	TODO:
                //                 		change the isActive and make another function to validate it ;
                //                 		change pushNotify also
                                
                //                 obj.isActive = true;
                //                 obj.pushNotify = true;
                //                 collection.insert(obj, function(err) {
                //                     if (err) console.log(err);
                //                 });
                //             }
                //         });
                //     }
                // });
            } catch (e) {
                console.log(e, obj.url);
            }
        } else {
            console.log(obj.url, err);
        }
    })
}

var start = function() {
    console.log("starting TOI");

    request(URL, function(err, status, body) {
        if (!err) {
            // console.log(status.statusCode);
            // fs.writeFile(__dirname + '/response.html', body, (err) => { console.log(err); });
            var $ = cheerio.load(body);
            var list = $('#lateststories li').each(function() {

                var title = "" + $(this).text();
                var regex = new RegExp(config.dataCollector.keywords.join('|'), 'gi');
                var matchFound = title.match(regex);
                if (matchFound != null) {
                    // console.log(this);
                    getDetails(this, $);
                }


            });

        } else {
            console.log(err);
        }
    });
}

module.exports = start;
