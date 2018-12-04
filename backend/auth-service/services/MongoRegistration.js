let User = require("../models/User");
const bcrypt = require("bcrypt");

class MongoRegistration {

    register(req, res, next) {       
        let user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 4)
        });

        user.save().then(document => {
            res.json(document);
        }).catch(err => res.json(err));
    }

    login(req, res, next) {
        res.send("login");
    }
    logout(req, res, next) {
        res.send("logout");
    }
}

module.exports = MongoRegistration;