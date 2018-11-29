class Registration {
    register(req, res, next) {
        res.send("register");
    }
    login(req, res, next) {
        res.send("login");
    }
    logout(req, res, next) {
        res.send("logout");
    }
}

module.exports = Registration;