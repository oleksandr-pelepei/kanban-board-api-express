var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var bcryptOptions = require('../../config/development/').bcrypt;

var schema = Schema({
  first_name: {
    type: String,
    required: true,
    index: true
  },
  last_name: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(v);
      },
      message: '{VALUE} is not a valid email.'
    }
  },
  _password: {
    type: String,
    required: true
  }
});

schema.virtual('password')
  .get(function() {
    return this._password;
  })
  .set(function(val) {
    this._password = bcrypt.hashSync(val, bcryptOptions.saltRounds);
  });


/**
 * Check user password
 */
schema.methods.checkPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

/**
 * 
 */
schema.methods.canUserPut = schema.methods.canUserDelete = function(user) {
  var _this = this;
  return new Promise(function(res, rej) {
    res(_this._id == user._id)
  });
}

var model = mongoose.model('User', schema);

module.exports = model;