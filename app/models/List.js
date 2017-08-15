var mongoose = require('mongoose');
var Board = require('./Board');
var chageDocPos = require('../utils/change-doc-pos');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Mixed = Schema.Types.Mixed;

var schema = new Schema({
  author: {
    type: ObjectId,
    required: true,
    ref: 'User'
  },
  board: {
    type: ObjectId,
    required: true,
    ref: 'Board'
  },
  name: {
    type: String,
    required: true
  },
  pos: {
    type: Number,
    required: true
  }
});

/**
 * Check whether user can post lists to board
 */
schema.statics.canUserPost = function(user, data) {
  return new Promise(function(res, rej) {
    Board.findById(data.board, function(err, board) {
      if (err || !board) {
        return res(false);
      }

      board.canUserPut(user).then(res);
    });
  });
};

schema.methods.canUserGet = function(user) {
  var _this = this;
  return new Promise(function(res, rej) {
    Board.findById(_this.board, function(err, board) {
      if (err || !board) {
        return res(false);
      }

      board.canUserGet(user).then(res);
    });
  });
};

/**
 * Check user permission modificate list
 * Only members and author of board can modificate its lists
 */
schema.methods.canUserPut = schema.methods.canUserDelete = function(user) {
  var _this = this;
  return new Promise(function(res, rej) {
    Board.findById(_this.board, function(err, board) {
      if (err || !board) {
        return res(false);
      }

      board.canUserPut(user).then(res);
    });
  });
};

var model = mongoose.model('List', schema);

module.exports = model;