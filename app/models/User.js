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

/**
 * Mking password hash
 */
schema.pre('save', true, function(next, done) {
  var self = this;

  bcrypt.hash(self.password, salt, function(err, hash) {
    if (err) {
      return done(err);
    } 

    self.password = hash;
    return done();
  });

  next();
});

/**
 * Check user password
 */
schema.methods.checkPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

var model = mongoose.model('User', schema);

module.exports = model;