/* eslint-disable no-undef */

const MONGODB = "mongodb";
const DYNAMODB = "dynamobd";
module.exports = {
    MONGODB,
    DYNAMODB,
    web: {
        port: process.env.PORT || 3000,    
    },    
    db: {
        driver: process.env.DB_DRIVER || DYNAMODB,
        sql : {},
        dynamodb : {

        },
        mongo: {
            connection_string: process.env.MONGO_URL + "/" + process.env.MONGO_DB      ,
            connection_url: process.env.MONGO_URL ,
            db_name:  process.env.MONGO_DB      
        }
    }
};