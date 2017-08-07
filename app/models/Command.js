var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var schema = new Schema({
  author: ObjectId,
  name: {
    type: String,
    required: true
  },
  members: {
    type: [ObjectId]
  }
});

var model = mongoose.model('Command', schema);

module.exports = model;