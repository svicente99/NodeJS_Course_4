var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passport_local_mongoose = require('passport-local-mongoose');

var User = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    }
});

User.plugin(passport_local_mongoose);

module.exports = mongoose.model('User', User);

