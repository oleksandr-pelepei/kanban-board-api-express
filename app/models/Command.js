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

/**
 * Validation: command members fields must not contain author id
 */
schema.pre('save', function(next) {
  if (this.members.indexOf(this.author) != -1) {
    return next( new Error('You cannot add author as a command member.') );
  }
  next();
});

/**
 * Validation: members must be uniue values
 */
schema.pre('save', function(next) {

  if ( !isArrElementsUnique( stringifyArrOfObjIds(this.members) ) ) {
    return next( new Error('Members array must have only unique values.') );
  }

  next();
});

/**
 * Find all commands user belongs to 
 * @param {String | Object} userObjOrId Id of the user or user object
 */
schema.statics.findUserCommands = function(userObjOrId, cb) {
  var userId;

  if (typeof userObjOrId == 'Object') {
    userId = userObjOrId._id;
  } else {
    userId = userObjOrId;
  }

  return this.find({
    $or: [
      {
        author: userId
      },
      {
        members: {
          $all: [userId]
        }
      }
    ]
  }, cb);
};

/**
 * Check whether user is author of the command
 * @param {Object} user
 */
schema.methods.isAuthor = function(user) {
  return user._id == this.author;
};

/**
 * Check whether user belongs this command
 * @param {Object} user
 */
schema.methods.containUser = function(user) {
  return stringifyArrOfObjIds(this.members).indexOf(user._id) != -1;
};

/**
 * Add new user to command
 * @param {String} userId
 */
schema.methods.addMember = function(userId) {
  this.members.push(userId);
}

/**
 * Delete user from command
 * @param {String} userId
 */
schema.methods.deleteMember = function(userId) {
  var memberPosition = stringifyArrOfObjIds(this.members).indexOf(userId);

  if (memberPosition != -1) {
    this.members.splice(memberPosition, 1);
  } 
}

var model = mongoose.model('Command', schema);

/**
 * Conver array of ObjectId ids to array of String ids
 * 
 * This method was necessary because members array indexOf method has not 
 * start index parameter, so i decided convert it to simple array of strings to ensure 
 * indexOf searching 
 * 
 * @param {Array} arr 
 * @return {Array}
 */
function stringifyArrOfObjIds(arr) {
  return arr.map(function(memberObjectId) {
    return memberObjectId.toString();
  });
}

/**
 * Check whether all memmbers of array are unique (doesnt work for objects)
 * 
 * @param {Array} arr 
 * @return {Boolean} Return false if array has to identic elements
 */
function isArrElementsUnique(arr) {
  for (var index = 0; index < arr.length; index++) {
    var element = arr[index];   

    if (arr.indexOf(element, index + 1) != -1) {
      return false;
    }
  }
  return true;
}

module.exports = model;