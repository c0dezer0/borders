const controller = require('./controller');

function initData(app) {

    app.get('/api/news', controller.getNews);
    
    app.get('/api/health', controller.health);
}

module.exports = initData
