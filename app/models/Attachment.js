var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  extention: {
    type: String,
    required: true,
    unique: true
  }
});

var model = mongoose.model('Attachment', schema);

module.exports = model;