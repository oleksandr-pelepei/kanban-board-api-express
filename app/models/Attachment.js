var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var schema = new Schema({
  filename: {
    type: String,
    required: true,
    unique: true
  },
  destination: {
    type: String,
    required: true
  },
  author: {
    type: ObjectId,
    required: true
  }
});

schema.virtual('url').get(function() {
  return this.destination + this.filename;
});


/**
 * Check whether user is author of the attachment
 * @param {Object} user
 */
schema.methods.isAuthor = function(user) {
  return user._id == this.author;
};

var model = mongoose.model('Attachment', schema);

module.exports = model;