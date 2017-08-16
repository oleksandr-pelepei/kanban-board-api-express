var mongoose = require('mongoose');
var Command = require('./Command');
var List = require('./List');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var schema = new Schema({
  name: {
    type: String,
    required: true
  },
  author: {
    type: ObjectId,
    required: true,
    ref: 'User'
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
  members: [{
    type: ObjectId,
    ref: 'User'
  }],
  command: {
    type: ObjectId,
    ref: 'Command'
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
  var _this = this;
  return new Promise(function(res, rej) {
    if (!_this.command) {
        return res(false);
    }

    Command.findById(_this.command, function(err, command) {
      if (err) {
        return rej(err);
      }

      res( command.hasUser(user) );
    });
  });
};

schema.methods.getBoardLists = function() {
  var _this = this;
  return new Promise(function(res, rej) {
    List.find({
      board: _this._id
    }, function(err, lists) {
      if (err || lists.length == 0) {
        res([]);
      } else {
        res(lists)
      }
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
schema.methods.canUserGet = function(user) {
  var _this = this; 

  return new Promise(function(res, rej) {
    switch (_this.privacy) {
      case 'private':
        res(_this.isAuthor(user) || _this.isMember(user));        
        break;
    
      case 'command':
        console.log('board');
        if (_this.isAuthor(user) || _this.isMember(user)) {
          res(true);
        } else {
          _this.isUserBoardCommandMemeber(user).then(res);
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
 * Only author and board members can make
 * 
 * @param {Object} user
 * @return {Boolean} 
 */
schema.methods.canUserPut = 
schema.methods.canUserDelete = function(user) {
  var _this = this;
  return new Promise(function(res, rej) {
    res( _this.isAuthor(user) || _this.isMember(user) );
  }); 
};

var model = mongoose.model('Board', schema);

module.exports = model;