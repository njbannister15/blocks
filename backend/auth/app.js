var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var SwagExpress = require('swagexpress');

const services = require('./services')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let swagexpress = new SwagExpress(app, services, api);
swagexpress.create()
    .then(app => {
        console.log(app)
    })
    .catch(function (err) {
        console.error(err);
    });

//app.use('/', indexRouter);
//app.use('/users', usersRouter);

module.exports = app;
