var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

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
 * Check user password
 */
schema.methods.checkPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

var model = mongoose.model('User', schema);

module.exports = model;