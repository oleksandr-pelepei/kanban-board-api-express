var express = require('express');
var router = express.Router();
var passport = require('passport');
var Command = require('../models/Command');

/**
 * @apiDefine SingleCommandSuccessRes 
 * @apiSuccess {String} _id Command id
 * @apiSuccess {String} author Command author's id
 * @apiSuccess {String} name Command name
 * @apiSuccess {Array} members User's invited to this command
 * 
 * @apiSuccessExample {json} Success-Response:
     HTTP/1.1 200 OK
     {
       "_id": "432u98u8fdsfoi",
       "author": "3824h9dfs8u89fds"
       "name": "Command Name"
       "members": [
         "f89y93u2h98f8d9",
         "f08usd0f8jj0dsj"
       ]
     }
 */


/** Errors */

/**
 * @apiDefine CommandWasNotFoundError Command with such parameters was not found
 * @apiError CommandWasNotFound
 * @apiErrorExample {json} CommandWasNotFoundError-Response:
     HTTP/1.1 404 Not Found
     {
       "error": {
         "message": "Such command was not found."
       }
     }
 */

/**
 * @apiDefine YouHaveNotAccessToThisDataError You have not access to this data
 * @apiError YouHaveNotAccessToThisData
 * @apiErrorExample {json} YouHaveNotAccessToThisDataError-Response:
     HTTP/1.1 403 Forbidden
     {
       error: {
         message: "You have not access to this data."
       }
     }
 * 
 */

/**
 * @apiDefine YouAreNotAllowedModificateError You have not permissions modificate this data
 * @apiError YouAreNotAllowedModificate
 * @apiErrorExample {json} YouAreNotAllowedModificateError-Response:
     HTTP/1.1 403 Forbidden
     {
       error: {
         message: "You are not allowed modificate this data."
       }
     }
 * 
 */

 
// Authenticated user only can make next actions
router.use([
    '/commands', 
    '/command', 
    '/command/:id', 
    '/command/:id/member/:memberId'
  ], 
  passport.authenticate('jwt', { session: false }));


/**
 * @api {get} /commands Get commands of current user
 * @apiName GetCommands
 * @apiGroup Command
 * 
 * @apiUse NonAuthorizedError
 * 
 * @apiSuccess {Object[]} commands Commands that current user belong to
 */
router.get('/commands', function(req, res) {
  Command.findUserCommands(req.user._id, function(err, commands) {
    if (err) {
      return res.json({
        error: {
          message: err.message
        }
      });
    }

    if (!commands) {
      res.json([]);
    }

    res.json(commands);
    
  });
});

/**
 * @api {post} /command Create new command
 * @apiName PostCommand
 * @apiGroup Command
 * 
 * @apiParam  {String} name Name of the command
 * @apiParam  {String[]} [members] List of users' ids
 * 
 * @apiUse NonAuthorizedError
 * 
 * @apiUse CommandSuccessRes
 */
router.post('/command', function(req, res) {
  req.body.author = req.user._id;

  Command.create(req.body, function(err, command) {
    if (err) {
      return res.json({
        error: {
          message: err.message
        }
      });
    }

    res.json(command);
  })
});

router.route('/command/:id')

  /**
   * @api {get} /command/:id Get command data by id
   * @apiName GetCommand
   * @apiGroup Command
   * 
   * @apiParam {String} id 
   * 
   * @apiPermission AuthorizationRequired
   * 
   * @apiUse AuthorizationRequired
   * 
   * @apiUse NonAuthorizedError
   * @apiUse CommandWasNotFoundError
   * @apiUse YouHaveNotAccessToThisDataError
   * 
   * @apiUse SingleCommandSuccessRes
   */
  .get(function(req, res) {
    Command.findById(req.params.id, function(err, command) {
      if (err) {
        return res.json({
          error: err.message
        });
      }

      if (!command) {
        return res.status(404).json({
          error: "Such command was not found."
        });
      }

      if ( !command.isAuthor(req.user) && !command.containUser(req.user) ) {
        return res.status(403).json({
          error: {
            message: "You have not access to this data."
          }
        });
      }
      
      res.json(command);
    });
  })

  
  /**
   * @api {put} /command/:id Modidicate command's data
   * @apiName PutCommand
   * @apiGroup Command
   * 
   * @apiParam {String} id 
   * @apiParam {String} [name] Command name
   * @apiParam {String[]} [members] Command members' ids
   * 
   * @apiPermission AuthorizationRequired
   * 
   * @apiUse AuthorizationRequired
   * 
   * @apiUse NonAuthorizedError
   * @apiUse CommandWasNotFoundError
   * @apiUse YouAreNotAllowedModificateError
   * 
   * @apiUse SingleCommandSuccessRes
   */
  .put(function(req, res) {
    Command.findById(req.params.id, function(err, command) {
      if (err) {
        return res.json({
          error: err.message
        });
      }

      if (!command) {
        return res.status(404).json({
          error: {
            message: "Such command was not found."
          }
        });
      }

      if ( !command.isAuthor(req.user) ) {
        return res.status(403).json({
          error: {
            message: "You are not allowed modificate this data."
          }
        });
      }

      for (var commandProp in req.body) {
        command[commandProp] = req.body[commandProp];
      }

      command.save(function(err, updatedCommand) {
        if (err) {
          return res.json({
            error: {
              message: err.message
            }
          });
        }

        res.json(updatedCommand);
      });
    });
  })

  /**
   * @api {delete} /command/:id Delete command
   * @apiName DeleteCommand
   * @apiGroup Command
   * 
   * @apiParam {String} id 
   * 
   * @apiPermission AuthorizationRequired
   * 
   * @apiUse AuthorizationRequired
   * 
   * @apiUse NonAuthorizedError
   * @apiUse YouAreNotAllowedModificateError
   * 
   * @apiSuccess {Object} empty Empty Object
   * @apiSuccessExample {json} Success-Response:
       HTTP/1.1 200 OK
       {}
   */
  .delete(function(req, res) {
    Command.findById(req.params.id, function(err, command) {
      if (!command) {
        return res.json({});
      }

      if ( !command.isAuthor(req.user) ) {
        return res.status(403).json({
          error: {
            message: "You are not allowed modificate this data."
          }
        });
      }

      Command.deleteOne({_id: req.params.id}, function(err, operationRes) {
        if (err) {
          return res.json({
            error: {
              message: err.message
            }
          })
        }

        res.json({});
      });
    });
  });

router.route('/command/:id/member/:memberId')

  /**
   * @api {post} /command/:id/member/:memberId Add member to command
   * @apiName PostCommandMember
   * @apiGroup Command
   * 
   * @apiParam {String} id Command id
   * @apiParam {String} memberId Id of user you want invite to room
   * 
   * @apiPermission AuthorizationRequired
   * 
   * @apiUse AuthorizationRequired
   * 
   * @apiUse NonAuthorizedError
   * @apiUse CommandWasNotFoundError
   * @apiUse YouAreNotAllowedModificateError
   * 
   * @apiUse SingleCommandSuccessRes
   */
  .post(function(req, res) {
    Command.findById(req.params.id, function(err, command) {
      if (err) {
        return res.json({
          error: err.message
        });
      }

      if (!command) {
        return res.status(404).json({
          error: {
            message: "Such command was not found."
          }
        });
      }

      // Only author and team members can invite another users to command
      if ( !command.isAuthor(req.user) && !command.containUser(req.user) ) {
        return res.status(403).json({
          error: {
            message: "You are not allowed modificate this data."
          }
        });
      }

      command.addMember(req.params.memberId);

      command.save(function(err, updatedCommand) {
        if (err) {
          return res.json({
            error: {
              message: err.message
            }
          });
        }

        res.json(updatedCommand);
      });
    });
  })

  
  /**
   * @api {delete} /command/:id/member/:memberId Remove member from command
   * @apiName DeleteCommandMember
   * @apiGroup Command
   * 
   * @apiParam {String} id Command id
   * @apiParam {String} memberId Id of user you want invite to room
   * 
   * @apiPermission AuthorizationRequired
   * 
   * @apiUse AuthorizationRequired
   * 
   * @apiUse NonAuthorizedError
   * @apiUse YouAreNotAllowedModificateError
   * 
   * @apiUse SingleCommandSuccessRes
   */
  .delete(function(req, res) {
    Command.findById(req.params.id, function(err, command) {
      if (err) {
        return res.json({
          error: err.message
        });
      }

      if (!command) {
        return res.status(404).json({
          error: {
            message: "Such command was not found."
          }
        });
      }

      // Only author can delete user from command
      if ( !command.isAuthor(req.user) ) {
        return res.status(403).json({
          error: {
            message: "You are not allowed modificate this data."
          }
        });
      }

      command.deleteMember(req.params.memberId);

      command.save(function(err, updatedCommand) {
        if (err) {
          return res.json({
            error: {
              message: err.message
            }
          });
        }

        res.json(updatedCommand);
      });
    });
  });

module.exports = router;