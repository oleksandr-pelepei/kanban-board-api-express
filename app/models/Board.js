var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var schema = new Schema({
  name: {
    type: String,
    required: true
  },
  author: {
    type: ObjectId,
    required: true
  },
  privacy: {
    type: String,
    required: true,
    default: 'private'
  },
  background: {
    type: String,
    required: true,
    default: '#fff'
  },
  members: {
    type: [ObjectId]
  }
});

var model = mongoose.model('Board', schema);

module.exports = model;