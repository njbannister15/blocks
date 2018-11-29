var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var SwagExpress = require('swagexpress');


var SwaggerParser = require('swagger-parser');
var Ajv = require('ajv');
var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
var _ = require('lodash');

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


let assigner = (app, operation, pathValue, pathKey, validater, services) => {
    let opObj = pathValue[operation];
    app[operation](pathKey, validater, services[opObj.tags[0]][opObj.operationId])
}

SwaggerParser.validate(__dirname + '/api/swagger.yaml')
    .then(function (api) {
        console.log("API name: %s, Version: %s", api.info.title, api.info.version);

        SwaggerParser.parse(__dirname + '/api/swagger.yaml')
            .then((api) => {

                let swagexpress = new SwagExpress(app, services, api);
                return swagexpress.create()
/*
                SwaggerParser.resolve(__dirname + '/api/swagger.yaml').then($refs => {
                    _.forIn(api.paths, (pathValue, pathKey) => {
                        if (pathValue.get) {
                            // assigner(app, "get", pathValue, pathKey, services);
                        }
                        if (pathValue.put) {
                            assigner(app, "put", pathValue, pathKey, services);
                        }
                        if (pathValue.post) {
                            if (pathValue.post.hasOwnProperty("requestBody")) {
                                let requestBody = pathValue.post.requestBody;
                                let schema = $refs.get(requestBody.content["application/json"].schema.$ref);
                                let validate = ajv.compile(schema);
                                let validater = (req, res, next) => {
                                    if (validate(req.body)) {
                                        return next();
                                    };
                                    res.status(400).json(validate.errors);
                                };
                                return assigner(app, "post", pathValue, pathKey, validater, services);
                            }
                            assigner(app, "post", pathValue, pathKey, (req, res, next) => next(), services);

                        }
                        if (pathValue.delete) {
                            assigner(app, "delete", pathValue, pathKey, services);
                        }
                        if (pathValue.options) {
                            assigner(app, "options", pathValue, pathKey, services);
                        }
                        if (pathValue.head) {
                            assigner(app, "head", pathValue, pathKey, services);
                        }
                        if (pathValue.patch) {
                            assigner(app, "patch", pathValue, pathKey, services);
                        }
                        if (pathValue.trace) {
                            assigner(app, "trace", pathValue, pathKey, services);
                        }
                    })
                })
*/
            })
            .then(app => {
                console.log(app)
            })
            .catch(err => console.log(err))
    })
    .catch(function (err) {
        console.error(err);
    });



app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
