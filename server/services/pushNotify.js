var FCM = require('fcm-push');
var config = require('../../config.js');


var serverKey = config.pushNotificationKey;
var fcm = new FCM(serverKey);

var init = function(topic, title, body, cb) {
    var message = {
        to: topic, // required fill with device token or topics
        collapse_key: 'news',
        data: {
            your_custom_data_key: 'your_custom_data_value'
        },
        notification: {
            title: title,
            body: body
        }
    };

    //callback style
    fcm.send(message, function(err, response) {
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
        if(typeof cb == 'function')
            cb(err, response);
    });
}
module.exports = init;
