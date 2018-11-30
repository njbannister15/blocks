
const Schema = require("../lib/MongoGoose/Schema");
let mongogoose = require("../lib/MongoGoose/MongoGoose");

let schema = new Schema(
    {
        firstName: {
            type: "string",
        },
        lastName: {
            type: "string"
        },
        email: {
            type: "string",
            index: 1,
            unique: true
        }
    }, {
        collection: "user"
    }
);

let User = mongogoose.model("User", schema);

module.exports = User;
