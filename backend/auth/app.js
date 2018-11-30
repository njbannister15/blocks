require("dotenv").config()

/* eslint-disable no-undef */
/* eslint-disable no-console */
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const SwagExpress = require("swagexpress");
//const mongoose = require("mongoose");
const mongogoose = require("./lib/MongoGoose/MongoGoose");
const services = require("./services");
const debug = require("debug")("auth:app");
const config = require("./config");

let app = express();

app.use(logger("dev"));
app.use(bodyParser.json()); // for parsing application/json
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


mongogoose.connect(config.db.mongo.connection_url, config.db.mongo.db_name);
let db = mongogoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    let swagexpress = new SwagExpress(app, services, __dirname + "/api/swagger.yaml");
    swagexpress.create()
        .then(() => {
            debug("App successully created from swagger definition.");
        })
        .catch(function (err) {
            debug(err);
        });
});

/*
mongoose.connect(config.db.mongo.connection_string, { useNewUrlParser: true });
let db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    let swagexpress = new SwagExpress(app, services, __dirname + "/api/swagger.yaml");
    swagexpress.create()
        .then(app => {
            debug(app);
        })
        .catch(function (err) {
            debug(err);
        });
});
*/

module.exports = app;
