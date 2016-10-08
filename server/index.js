var express = require('express');
var config = require('../config');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();

var compression = require('compression');
app.use(compression());
// app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use('/static', express.static(path.resolve(__dirname + '/../public')));


var api = require('./api').init(app);
var dataCollector = require('./dataCollector').init(app);
// var user = require('./')
app.get('/ping', (req, res) => {
    res.send("pong");
});

app.get('/', (req, res) => {
    res.send('this is news app');
});

app.get('/*', (req, res) => {
    res.redirect('/');
});

module.exports = app;
