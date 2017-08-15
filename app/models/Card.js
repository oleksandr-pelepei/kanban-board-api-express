var mongoose = require('mongoose');
var List = require('./List');

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
  list: {
    type: ObjectId,
    required: true
  },
  position: {
    type: Number,
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

schema.statics.canUserPost = function(user, data) {
  return new Promise(function(res, rej) {
    List.findById(data.list, function(err, list) {
      if (err || !list) {
        return res(false);
      }

      list.canUserPut(user).then(res);
    });
  });
};


schema.methods.canUserGet = function(user) {
  var _this = this;
  return new Promise(function(res, rej) {
    List.findById(_this.list, function(err, list) {
      if (err || !list) {
        return res(false);
      }

      list.canUserGet(user).then(res);
    });
  });
};

/**
 * Check user permission modificate card
 * Only users that can modificate list 
 */
schema.methods.canUserPut = schema.methods.canUserDelete = function(user) {
  var _this = this;
  return new Promise(function(res, rej) {
    List.findById(_this.list, function(err, list) {
      if (err || !list) {
        return res(false);
      }

      list.canUserPut(user).then(res);
    });
  });
};


var model = mongoose.model('Card', schema);

module.exports = model;