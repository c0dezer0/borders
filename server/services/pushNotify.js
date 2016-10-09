
var config = require('../../config.js');
var request = require('request');

var serverKey = 'key='+config.pushNotificationKey;

// console.log(fcm.send());
var init = function(topic, title, body, cb) {
    var message = {
        to: '/topics/news',
        notification: {
            title: title,
            body: body
        }
    };
    var options = {
        method: 'POST',
        url: 'https://fcm.googleapis.com/fcm/send',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': serverKey
        },
        body: JSON.stringify(message)

    }
    request(options, function(err, status, body){
        console.log(err, body);
        cb(err, body);
    });

}
module.exports = init;
