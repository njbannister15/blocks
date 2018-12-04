const debug = require("debug")("swagespress:index");
const SwaggerParser = require("swagger-parser");
const Ajv = require("ajv");
const _ = require("lodash");

class ValidateMiddleware {
    /**
     * Constructor
     * @param {Object} schema The Json schema document.
     */
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
    /**
     * Constructor
     * @param {object} app The express app.
     * @param {object} services The services that should be assigned to routes.
     * @param {object} api The swagger api.
     */
    constructor(app, services, api) {
        this.app = app;
        this.api = api;
        this.services = services;
    }

    /**
     * Helper function that assigns handlers to paths.
     * @param {sting} httpVerb get The httpe verb (eg. get | put | post | patch | delete)
     * @param {object} pathValue 
     * @param {string} path The path (eg. /some/path/here)
     * @param {string} $refs The reference within the api (eg. #/components/schemas/UserPass)
     */
    _assigner(httpVerb, pathValue, path, $refs) {
        let opObj = pathValue[httpVerb];
        if (pathValue[httpVerb].hasOwnProperty("requestBody")) {
            let requestBody = pathValue[httpVerb].requestBody;
            let schema = $refs.get(requestBody.content["application/json"].schema.$ref);
            let validateMiddleware = new ValidateMiddleware(schema);
            this.app[httpVerb](path, validateMiddleware.validate, this.services[opObj.tags[0]][opObj.operationId]);
        } else {
            this.app[httpVerb](path, this.services[opObj.tags[0]][opObj.operationId]);
        }
    }

    /**
     * Creates and assignes the correct route handles and request validator to the express app.
     */
    create() {

        return new Promise((resolve, reject) => {
            SwaggerParser.parse(this.api)
                .then((api) => {
                    SwaggerParser.resolve(this.api).then($refs => {
                        _.forIn(api.paths, (pathValue, path) => {
                            if (pathValue.get) {
                                this._assigner("get", pathValue, path, $refs);
                            }
                            if (pathValue.put) {
                                this._assigner("put", pathValue, path, $refs);
                            }
                            if (pathValue.post) {
                                this._assigner("post", pathValue, path, $refs);
                            }
                            if (pathValue.delete) {
                                this._assigner("delete", pathValue, path, $refs);
                            }
                            if (pathValue.patch) {
                                this._assigner("patch", pathValue, path, $refs);
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