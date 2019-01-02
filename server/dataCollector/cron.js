var toi = require('./TOI/timesofindia.js');
var config = require('../../config.js');
var cron = require('node-cron');
 

module.exports = function(app){
	cron.schedule(config.cron, function(){
	  console.log('running a task every 5 minutes');
	  toi(app);
	});
	toi(app);
	
}