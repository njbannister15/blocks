const debug = require("debug")("dynogoose:index");
const EventEmitter = require("events");
const _ = require("lodash");

const AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB({
    region: "us-east-1"
});

class Emitter extends EventEmitter { }

const dataType = {
    "string": "S"
}

class DynoGoose {

    constructor() {
        this.connection = new Emitter();
    }

    connect() {
        var params = {
        };
        dynamodb.listTables(params,  (err, data) => {
            if (err) {
                debug(err);
                this.connection.emit("error");
            }
            else {
                debug(data);
                this.connection.emit("open");
            }
        });
    }

    disconnect() {

    }

    model(name, schema) {
        return class {
            constructor(data) {
                this.data = data;
                this.schema = schema;
                this.name = name;
            }

            save() {

                return new Promise((resolve, reject) => {
                    let Item = {};
                    let schema = this.schema.schema;
                    let ConditionExpression = "";
                    _.forIn(schema, (value, key) => {
                        Item[key] = {
                            [dataType[schema[key].type]]: this.data[key]
                        }
                        if(value.unique){
                            ConditionExpression += `attribute_not_exists(${key}) AND `
                        }
                    })

                    let params = {
                        Item,
                        ReturnConsumedCapacity: "TOTAL",
                        TableName: this.schema.options.TableName,
                        ConditionExpression: ConditionExpression.slice(0,-5)
                    }

                    dynamodb.putItem(params, (err, data) => {
                        if (err) reject(err);
                        else resolve(data);
                    });

                })



            }
        };
    }
}

let dynogoose = new DynoGoose();


module.exports = {
    DynoGoose: dynogoose,
    Schema: require('./Schema')
}