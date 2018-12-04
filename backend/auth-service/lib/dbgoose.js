let config = require("../config");
if(config.db.driver === config.DYNAMODB){
    module.exports = require("dbgoose").DynoGoose;
}
else if(config.db.driver === config.MONGODB){
    module.exports = require("dbgoose").MongoGoose;
}