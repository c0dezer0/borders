var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');
var config = require('../../../config.js');
var MongoClient = require('mongodb').MongoClient;

var URL = "http://timesofindia.indiatimes.com";

String.prototype.sanitize = function() {
    var x = this.replace(/\s\s+/g, ' ');
    x = x.replace(/\n/gi, '');
    x = x.replace(/\'s/gi, "'s");
    x = x.replace(/\'/gi, "");
    x = x.replace(/\+/g,'');
    return x;
}
var isDataPresent = function(obj){
    var isValid = true;

    if(!obj.title||obj.title.trim().length==0){
        isValid=false;
    }

    if(!obj.title_full||obj.title_full.trim().length==0){
        isValid=false;
    }
    if(!obj.body_full||obj.body_full.trim().length==0){
        isValid=false;
    }
    if(!obj.media.src||obj.media.src.trim().length==0){
        isValid=false;
    }
    if(!obj.publishedOn||obj.publishedOn.trim().length==0){
        isValid=false;
    }

    return isValid;
}
var getDetails = function(data, $) {
    var obj = {};
    obj.title = "" + $(data).text().sanitize();
    obj.url = $(data).find('a').attr('href')[0] == '/' ? (URL + $(data).find('a').attr('href')) : $(data).find('a').attr('href');
    obj.source = "toi";

    request(obj.url, function(err, status, body) {
        if (!err) {
            try {
                // fs.writeFile(__dirname + '/' + obj.title + '.html', body, (err) => { console.log(err); });
                var $ = cheerio.load(body);
                obj.title_full = "" + (obj.url.indexOf('blog') >= 0 ? $('h2').text().sanitize() : $('.heading1').text().sanitize());
                obj.body_full = "" + (obj.url.indexOf('blog') >= 0 ? $('.content').text().sanitize() : $('.section1').text().sanitize());

                obj.media = {
                    type: '' + (obj.url.indexOf('blog') >= 0 ? 'IMG' : 'IMG'),
                    src: (obj.url.indexOf('blog') >= 0 ? ($('.content').find('a').attr('href')?("https://blogs.timesofindia.indiatimes.com" + $('.content').find('a').attr('href').replace('../..', '')):'') : (URL + $('.highlight img').attr('src')))

                }

                obj.publishedOn = (obj.url.indexOf('blog') >= 0 ? $('.date').text() : $('.time_cptn span').text().replace(/Updated: |PTI|TNN|APAP|IANS/ig, ""));

                if(isDataPresent(obj)){
                    MongoClient.connect(config.db.url, function(error, db) {
                        if (!error) {
                            var collection = db.collection(config.db.collection);
                            collection.count(obj, function(e, c) {

                                if (!c) {

                                    // TODO:
                                    //  change the isActive and make another function to validate it ;
                                    //  change pushNotify also
                                    collection.update({ url: obj.url }, { $set: { isVerified: true, isActive: false } }, { multi: true }, function(err, result) {
                                        if (!err) {
                                            obj.isActive = true;
                                            obj.isVerified = true;
                                            obj.pushNotify = true;
                                            obj.date = (new Date()).getTime();
                                            collection.insert(obj, function(err) {
                                                if (err) console.log(err);
                                            });
                                        }

                                    });

                                }
                            });
                        }
                    });
                }
                else{
                    console.log(obj.url);
                }
                
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
            // this is for featured awesome news
            var $ = cheerio.load(body);

            var feature_title = $('#featuredstory').text().sanitize();
            var regex = new RegExp(config.dataCollector.keywords.join('|'), 'gi');
            var matchFound = feature_title.match(regex);
            if (matchFound != null) {

                var url = $('#featuredstory').find('a').attr('href');
                console.log(url, url.indexOf('/liveblog/'));
                if (url.indexOf('/liveblog/') == -1)
                    getDetails($('#featuredstory'), $);
            }


            var list = $('#lateststories li').each(function() {

                var title = "" + $(this).text();
                var regex = new RegExp(config.dataCollector.keywords.join('|'), 'gi');
                var matchFound = title.match(regex);
                if (matchFound != null) {
                    // console.log(this);
                    var url = $(this).find('a').attr('href');
                    if (url.indexOf('/liveblog/') == -1)
                        getDetails(this, $);
                }


            });


            var topStories = $('.top-story li').each(function() {
                var title = "" + $(this).text();
                var regex = new RegExp(config.dataCollector.keywords.join('|'), 'gi');
                var matchFound = title.match(regex);
                if (matchFound != null) {
                    // console.log(this);
                    var url = $(this).find('a').attr('href');
                    if (url.indexOf('/liveblog/') == -1)
                        getDetails(this, $);
                }
            });

        } else {
            console.log(err);
        }
    });
}

module.exports = start;
