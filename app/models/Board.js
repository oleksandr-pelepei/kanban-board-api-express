var mongoose = require('mongoose');
var Command = require('./Command');

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
    default: 'private',
    validate: {
      validator: function(v) {
        return v == 'private' || v == 'command' || v == 'public';
      },
      message: '{VALUE} is not a valid privacy type.'      
    }
  },
  background: {
    type: String,
    required: true,
    default: '#fff'
  },
  members: {
    type: [ObjectId]
  },
  command: {
    type: ObjectId
  }
});

schema.pre('save', function(next) {
  if (this.privacy == 'command' && !this.command) {
    return next( new Error('Command field is required for command privacy type.') );
  }
  next();
});

/**
 * Find all boards where where user is author or is member of board or 
 * is part of command board belong to
 * 
 * @param {Object} user
 * @param {Function} cb
 */
schema.statics.findUserBoards = function(user, cb) {
  var self = this;
  return Command.findUserCommands(user, function(err, commands) {
    if (err) {
      return cb(err);
    }

    var commandsIds = commands.map(function(command) {
      return command._id;
    });

    return self.find({
      $or: [
        {
          author: user._id
        },
        {
          members: {
            $all: [user._id]
          }
        },
        {
          command: {
            $in: commandsIds
          }
        }
      ]
    }, cb);

  });
};

/**
 * Check whether user is author of the board
 * @param {Object} user
 */
schema.methods.isAuthor = function(user) {
  return user._id == this.author;
};

/**
 * Check whether user is member of board
 * @param {Object} user
 * @return {Boolean}
 */
schema.methods.isMember = function(user) {
  return this.members.indexOf(user._id) != -1;
};

/**
 * Check whether user is member of the command this board belongs to
 * @param {Object} user
 * @return {Promise} Promise with boolean resolve
 */
schema.methods.isUserBoardCommandMemeber = function(user) {
  return new Promise(function(res, rej) {
    if (!this.command) {
        return res(false);
    }

    Command.findById(this.command, function(err, command) {
      if (err) {
        return rej(err);
      }
      
      return res( command.containUser(user) );
    });
  });
};

/**
 * Check user permissions read data
 * All registered users can read public boards
 * Aurhor, members, board's commad members can read command boards
 * Aurhor, members can read private boards
 * 
 * @param {Object} user
 * @return {Promise} Promise with boolean resolve
 */
schema.methods.canUserRead = function(user) {
  var self = this; 

  return new Promise(function(res, rej) {
    switch (self.privacy) {
      case 'private':
        if (self.isAuthor(user) || self.isMember(user)) {
          res(true);
        } else {
          res(false);
        }
        
        break;
    
      case 'command':

        if (self.isAuthor(user) || self.isMember(user)) {
          res(true);
        } else {
          self.isUserBoardCommandMemeber(user).then(function(result) {
            if (result) {
              res(true);
            } else {
              res(false);
            }
          });
        }
        break;
    
      case 'public':

        res(true);
        break;
    
      default:

        res(false);
        break;
    }
  });
}

/**
 * Check user permissions modificate data
 * Only author and board members cad do isAuthor
 * 
 * @param {Object} user
 * @return {Boolean} 
 */
schema.methods.canUserModificate = function(user) {
  return this.isAuthor(user) || this.isMember(user);
};

var model = mongoose.model('Board', schema);

module.exports = model;