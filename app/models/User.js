var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var saltRounds = 5;
var salt = bcrypt.genSaltSync(saltRounds);

var schema = new Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

// making password hash
schema.pre('save', true, function(next, done) {
  var self = this;

  bcrypt.hash(self.password, salt, function(err, hash) {
    if (err) {
      return done(err);
    } else {
      self.password = hash;
      return done();
    }
  });

  next();
});

var model = mongoose.model('User', schema);

module.exports = model;