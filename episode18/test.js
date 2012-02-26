var util = require('util');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    login: { Type: String },
    password: { Type: String },
    role: { Type: String }
});

// schema.index({login:1, password:1});

schema.statics.authenticate = function(login, password, callback) {
    return this.where({login:login, password:password}).run(callback);
};

mongoose.model('Users', schema);

var db = mongoose.createConnection('mongodb://localhost/db');

var Users = db.model('Users');

var user = new Users({login:'hoge', password:'fuga', role:'piyo'});
user.save();

//Users.find({}, function (err,users) {
//});

//Users.findOne({}, function (err,user) {
//});

Users.authenticate(user.login, user.password, function (err, user) {
    console.log(err);
    console.log(user);
});

