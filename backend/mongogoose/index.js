const debug = require("debug")("mongogoose:index");
const MongoClient = require("mongodb").MongoClient;
const EventEmitter = require("events");
const _ = require("lodash");

class Emitter extends EventEmitter { }

class MongoGoose {

    constructor() {
        this.models = {};
        this.db = null;
        this.connection = new Emitter();
        this.client = null;
    }    

    connect(url, dbName) {
        this.db;

        this.client = new MongoClient(url, { useNewUrlParser: true });
        // Use connect method to connect to the Server
        this.client.connect((err) => {
            if (err) {
                debug(err);
                this.client.close();
                this.connection.emit("error");
                return;
            }
            debug(`Connected successfully to server: ${url}/${dbName}`);
            this.db = this.client.db(dbName);
            this.connection.emit("open");
        });
    }

    disconnect() {
        this.client.close();
    }

    model(name, schema) {
        this.models[name] = schema;

        return class {
            constructor(data) {
                this.data = data;
                this.schema = schema;
                this.name = name;
                this.collection = mongogoose.db.collection(schema.options.collection);
                this._setupCollection();
            }

            _setupCollection() {
                _.forIn(this.schema.schema, (value, key) => {
                    if (value.index) {
                        this.collection.indexExists(key).then(exists => {
                            if (!exists) {
                                this.collection.createIndex(
                                    {
                                        [key]: value.index
                                    }, {
                                        name: key,
                                        sparse: value.sparse,
                                        unique: value.unique
                                    });
                            }
                        }).catch(err => debug(err));
                    }
                });
            }

            save() {
                return this.collection.insertOne(this.data);
            }
        };
        
    }

    


}

let mongogoose = new MongoGoose();


module.exports = {
    MongoGoose: mongogoose,
    Schema : require("./Schema")
}

