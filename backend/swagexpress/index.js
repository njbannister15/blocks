const SwaggerParser = require("swagger-parser");
const Ajv = require("ajv");
const _ = require("lodash");
const debug = require("debug")("swagexpress");

class ValidateMiddleware {
    constructor(schema) {
        this.ajv = new Ajv();
        this.schema = schema;
        this.validate = this.validate.bind(this);
    }

    validate(req, res, next) {
        let ajvValidate = this.ajv.compile(this.schema);
        if (ajvValidate(req.body)) {
            return next();
        }
        res.status(400).json(ajvValidate.errors);
    }
}

class SwagExpress {
    constructor(app, services, api) {
        this.app = app;
        this.api = api;
        this.services = services;

        
    }

    assigner(operation, pathValue, pathKey, validater = (req, res, next) => next()) {
        
        let opObj = pathValue[operation];
        this.app[operation](pathKey, validater, this.services[opObj.tags[0]][opObj.operationId]);
    }


    assignerV2(operation, pathValue, pathKey, refs) {
        let opObj = pathValue[operation];
        if (pathValue[operation].hasOwnProperty("requestBody")) {
            let requestBody = pathValue[operation].requestBody;
            let schema = refs.get(requestBody.content["application/json"].schema.$ref);
            let validateMiddleware = new ValidateMiddleware(schema);            
            this.app[operation](pathKey, validateMiddleware.validate, this.services[opObj.tags[0]][opObj.operationId]);
        } else {            
            this.app[operation](pathKey, this.services[opObj.tags[0]][opObj.operationId]);
        }      
        
    }

    create() {

        return new Promise((resolve, reject) => {
            SwaggerParser.parse(this.api)
                .then((api) => {
                    SwaggerParser.resolve(this.api).then($refs => {
                        _.forIn(api.paths, (pathValue, pathKey) => {
                            if (pathValue.get) {
                                this.assignerV2("get", pathValue, pathKey, $refs);
                            }
                            if (pathValue.put) {
                                this.assignerV2("put", pathValue, pathKey, $refs);
                            }
                            if (pathValue.post) {
                                this.assignerV2("post", pathValue, pathKey, $refs);
                                /*
                                if (pathValue.post.hasOwnProperty("requestBody")) {
                                    let requestBody = pathValue.post.requestBody;
                                    let schema = $refs.get(requestBody.content["application/json"].schema.$ref);
                                    let validateMiddleware = new ValidateMiddleware(schema);
                                    this.assigner("post", pathValue, pathKey, validateMiddleware.validate);
                                } else {
                                    this.assigner("post", pathValue, pathKey);
                                }*/
                            }
                            if (pathValue.delete) {
                                this.assigner("delete", pathValue, pathKey);
                            }
                            if (pathValue.patch) {
                                this.assigner("patch", pathValue, pathKey);
                            }
                        });
                        resolve(this.app);
                    }).catch(err => reject(err));
                })
                .catch(err => reject(err));
        });
    }
}

module.exports = SwagExpress;