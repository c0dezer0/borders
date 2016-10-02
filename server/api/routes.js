const controller = require('./controller');

function initData(app) {

    app.get('/api/news', controller.getNews);
    // app.put()
    app.get('/api/health', controller.health);
}

module.exports = initData
