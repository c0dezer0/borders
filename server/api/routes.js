const controller = require('./controller');

function initData(app) {

    app.get('/api/news', controller.getNews);

    app.get('/api/news/search', controller.newsSearch);

    app.get('/api/news/:id', controller.getNewsDetails);
    
    app.get('/api/news/:id/push', controller.sendPushNotification);

    app.delete('/api/news/:id', controller.deleteNews);
    
    app.get('/api/health', controller.health);
}

module.exports = initData
