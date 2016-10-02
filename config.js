module.exports = {
    "db": {
        "url": "mongodb://admin:admin@ds021356.mlab.com:21356/border",
        "collection": "news"
    },
    "port": process.env.PORT || '9000',
    "env": process.env.NODE_ENV || "development",
    "host": "localhost",
    "dataCollector":{
    	"interval" : 600,  // time in seconds
    	"keywords": ['pakistan', 'terror', 'terrorist','pak', 'baloch','surgical']
    },
    "cron": "*/5 * * * *" // every 10 minutes
}
