let mongoose = require('mongoose')

var schema = new mongoose.Schema({ firstName: 'string', lastName: 'string' });
var User = mongoose.model('User', schema);