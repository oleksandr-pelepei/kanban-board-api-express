var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Mixed = Schema.Types.Mixed;

var schema = new Schema({
  name: {
    type: String,
    required: true
  },
  position: {
    type: Mixed,
    required: true
  }
});

var model = mongoose.model('List', schema);

module.exports = model;