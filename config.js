module.exports = {
    "db": {
        "url": "mongodb://admin:admin@ds021356.mlab.com:21356/border",
        "collection": "news"
    },
    "port": process.env.PORT || '9000',
    "env": process.env.NODE_ENV || "development",
    "host": "localhost",
    "dataCollector": {
        "keywords": ['pakistan', 'terror', 'terrorist', 'pak', 'baloch', 'surgical', 'uri', 'baramulla', 'attack', 'modi', 'demonetisation', 'kill', 'cash']
    },
    "cron": "*/5 * * * *", // every 10 minutes
    "pushNotificationKey": "AIzaSyBkzhOxrf7frA3gn66xfdGgXRiS4ou3kJU"
}
