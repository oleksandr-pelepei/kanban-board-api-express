var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Mixed = Schema.Types.Mixed;

var checkListSchema = new Schema({
  list_name: {
    type: String,
    required: true
  },
  items: {
    type: [new Schema({
      name: {
        type: String,
        required: true
      },
      status: {
        type: Boolean,
        required: true,
        default: false
      }
    })]
  }
});

var commentSchema = new Schema({
  author: {
    type: ObjectId,
    required: true
  },
  body: {
    type: String,
    required: true
  }
});

var schema = new Schema({
  name: {
    type: String,
    required: true
  },
  descriptions: {
    type: String
  },
  author: {
    type: ObjectId,
    required: true
  },
  members: {
    type: [ObjectId]
  },
  creating_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  due_date: {
    type: Date
  },
  position: {
    type: Mixed,
    required: true
  },
  check_lists: {
    type: [checkListSchema]
  },
  comments: {
    type: [commentSchema]
  },
  attachments: {
    type: [ObjectId]
  }
});

var model = mongoose.model('Card', schema);

module.exports = model;