
const config = require("../config");

let json_schema = {
    firstName: {
        type: "string"
    },
    lastName: {
        type: "string"
    },
    password: {
        type: "string"
    },
    email: {
        type: "string",
        index: 1,
        unique: true
    }
};


if (config.db.driver === config.MONGODB) {
    const __mongogoose__ = require("mongogoose");
    const MongoGoose = __mongogoose__.MongoGoose;
    const Schema = __mongogoose__.Schema;

    let schema = new Schema(json_schema, {
        collection: "user"
    });

    let User = MongoGoose.model("User", schema);

    module.exports = User;
}
else if (config.db.driver === config.DYNAMODB) {
    const __dynogoose__ = require("dynogoose");
    const DynoGoose = __dynogoose__.DynoGoose;
    const Schema = __dynogoose__.Schema;

    let schema = new Schema(json_schema, {
        TableName: "user"
        
    });

    let User = DynoGoose.model("User", schema);

    module.exports = User;
}
