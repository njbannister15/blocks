/* eslint-disable no-undef */
module.exports = {
    web: {
        port: process.env.PORT || 3000,    
    },    
    db: {
        mongo: {
            connection_string: process.env.MONGO_URL + "/" + process.env.MONGO_DB      
        }
    }
};