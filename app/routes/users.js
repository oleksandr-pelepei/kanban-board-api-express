var express = require('express');
var passport = require('passport');
var bcrypt = require('bcrypt');
var bcryptOptions = require('../../config/development/').bcrypt;

var User = require('../models/User');
var router = express.Router();

/**
 * @apiDefine SingleUserSuccessRes 
 * @apiSuccess {String} _id Id of the user
 * @apiSuccess {String} first_name First name of the user
 * @apiSuccess {String} last_name Last name of the user
 * @apiSuccess {String} email User's email
 * 
 * @apiSuccessExample {json} Success-Response:
     HTTP/1.1 200 OK
     {
       "_id": "user_id",
       "first_name": "First",
       "last_name": "Last",
       "email": "user.email@gmail.com"
     }
 */

/** Permissions */

/**
 * @apiDefine AuthorizationRequired Require jwt authorization
 * @apiHeader {String} Authorization JSON web token in format 'JWT token_here'
 */


/** Error blocks */

/**
 * @apiDefine NonAuthorizedError User has not added Jwt token to request or it's not correct
 * @apiError NonAuthorized
 * @apiErrorExample {json} NonAuthorizedError-Response:
     HTTP/1.1 401 Unauthorized
 * 
 */

/**
 * @apiDefine UnpredictedError 
 * @apiError Unpredicted
 * @apiErrorExample {json} NonAuthorizedError-Response:
     HTTP/1.1 200 OK
     {
       "error": {
         "message": "Error description"
       }
     }
 */

/**
 * @apiDefine UserWasNotFoundError User with such parameters was not found
 * @apiError UserWasNotFound
 * @apiErrorExample {json} UserWasNotFoundError-Response:
     HTTP/1.1 404 Not Found
     {
       "error": {
         "message": "Error description"
       }
     }
 */

/**
 * @apiDefine SuchEmailIsAlreadyUsedError User with such email already exists
 * @apiError SuchEmailIsAlreadyUsed User with such email already exists
 * @apiErrorExample {json} SuchEmailIsAlreadyUsedError-Response:
     HTTP/1.1 409 Conflict
     {
       "error": {
         "message": "User with such email already exists."
       }
     }
 * 
 */

/**
 * @apiDefine UserPasswordRequiredError 
 * @apiError UserPasswordRequired Password is required but was not defined
 * @apiErrorExample {json} UserPasswordRequiredError-Response:
     HTTP/1.1 400 Bad request
     {
       "error": {
         "message": "Password is required"
       }
     }
 */

/**
 * @apiDefine SomeFieldIsNotCorrectError 
 * @apiError SomeFieldIsNotCorrect Some of the fields are not correct or are missed
 * @apiErrorExample {json} SomeFieldIsNotCorrectError-Response:
     HTTP/1.1 400 Bad request
     {
       "error": {
         "message": "Description of error."
       }
     }
 */

/**
 * @apiDefine UserCannotModificateError Only current user can modificate he's data
 * @apiError UserCannotModificate
 * @apiErrorExample {json} UserCannotModificateError-Response:
     HTTP/1.1 403 Forbidden
     {
       "error": {
         "message": "You cannot modificate this user\'s data."
       }
     }
 */


/**
 * @api {post} /user Create new user
 * @apiName PostUser
 * @apiGroup User
 * 
 * @apiParam {String} first_name First name of the user
 * @apiParam {String} last_name Last name of the user
 * @apiParam {String} email User's email
 * @apiParam {String} password User's password
 * 
 * @apiUse SuchEmailIsAlreadyUsedError
 * @apiUse UserPasswordRequiredError
 * @apiUse SomeFieldIsNotCorrectError
 * 
 * @apiUse SingleUserSuccessRes
 */
router.post('/user', function(req, res) {
  if (!req.body.password) {
    return res.status(400).json({
      error: {
        message: 'Password is required'
      }
    });
  }

  req.body.password = bcrypt.hashSync(req.body.password, bcryptOptions.saltRounds);

  User.create(req.body, function(err, user) {
    if (err) {
      if (err.code == 11000) {
        return res.status(409).json({
          error: {
            message: "User with such email already exists."
          }
        });
      }

      return res.status(400).json({
        error: {
          message: err.message
        }
      });
    }

    res.json(user);
  });
});

// Authenticated user only can make next actions
router.use('/user/:id', passport.authenticate('jwt', { session: false }));

router.route('/user/:id')

  /**
   * @api {get} /user/:id Get user data by id
   * @apiName GetUser
   * @apiGroup User
   * 
   * @apiParam {String} id 
   * 
   * @apiPermission AuthorizationRequired
   * 
   * @apiUse AuthorizationRequired
   * 
   * @apiUse NonAuthorizedError
   * @apiUse UserWasNotFoundError
   * 
   * @apiUse SingleUserSuccessRes
   */
  .get(function(req, res) {
    User.findById(req.params.id, function(err, user) {
      if (err || !user) {
        return res.status(404).json({
          error: "Such user was not found."
        });
      }
      
      user.password = undefined;
      res.json(user);
    });
  })
  
  /**
   * @api {put} /user/:id Modificate user data
   * @apiName PutUser
   * @apiGroup User
   * 
   * @apiParam {String} id 
   * @apiParam {String} [first_name] First name of the user
   * @apiParam {String} [last_name] Last name of the user
   * @apiParam {String} [email] User's email
   * @apiParam {String} [password] User's password
   * 
   * @apiPermission AuthorizationRequired
   * 
   * @apiUse AuthorizationRequired
   * 
   * @apiUse NonAuthorizedError
   * @apiUse UserWasNotFoundError
   * @apiUse UserCannotModificateError
   * @apiUse SuchEmailIsAlreadyUsedError
   * 
   * @apiUse SingleUserSuccessRes
   */
  .put(function(req, res) {
    if (req.user._id != req.params.id) {
      return res.status(403).json({
        error: {
          message: 'You cannot modificate this user\'s data.'
        }
      })
    }

    // if requst contain new password it makes hash before saving
    if (req.body.password) {
      req.body.password = bcrypt.hashSync(req.body.password, bcryptOptions.saltRounds);
    }

    User.findById(req.params.id, function(err, user) {
      if (err || !user) {
        return res.status(404).json({
          error: "Such user was not found."
        });
      }

      for (var userProp in req.body) {
        user[userProp] = req.body[userProp];
      }

      user.save(function(err, updatedUser) {
        if (err) {
          
          if (err.code == 11000) {
            return res.status(409).json({
              error: {
                message: "User with such email already exists."
              }
            });
          }

          return res.json({
            error: {
              message: err.message
            }
          });
        }

        res.json(updatedUser);
      });
    });
  })

  
  /**
   * @api {delete} /user/:id Completely delete user
   * @apiName DeleteUser
   * @apiGroup User
   * 
   * @apiParam  {String} id 
   * 
   * @apiPermission AuthorizationRequired
   * 
   * @apiUse AuthorizationRequired
   * 
   * @apiUse NonAuthorizedError
   * @apiUse UserCannotModificateError
   * 
   * @apiSuccess {Object} empty Empty object
   */
  .delete(function(req, res) {
    if (req.user._id != req.params.id) {
      return res.status(403).json({
        error: {
          message: 'You cannot modificate this user\'s data.'
        }
      })
    }

    User.deleteOne({_id: req.params.id}, function(err, operationRes) {
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


/**
 * @api {get} /users/search/:searchString Search users by names and emails
 * @apiName SearchUsers
 * @apiGroup User
 * 
 * @apiParam {String} searchString Search string with name or email
 * 
 * @apiPermission AuthorizationRequired
 * 
 * @apiUse AuthorizationRequired
 * 
 * @apiUse NonAuthorizedError
 * 
 * @apiSuccess {Object[]} users Array of users objects or empty array if nothing was found
 */
router.get('/users/search/:searchString', function(req, res) {
  var searchString = req.params.searchString || '';

	if (searchString != '') {
		User
			.find({
				$or: [
					{
						first_name: {
							$regex: searchString,
							$options: 'i'
						}
					},
					{
						last_name: {
							$regex: searchString,
							$options: 'i'
						}
					},
					{
						email: {
							$regex: searchString,
							$options: 'i'
						}
					}
				]
			})
			.select('-password')
			.exec(function(err, users) {

				if (err) {
					res.json([]);
				} else {
					res.json(users);
				}

			});
	} else {
		res.json([]);
	}
});

module.exports = router;