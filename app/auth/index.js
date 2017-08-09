var express = require('express');

var passport = require('passport');
var jwt = require('jsonwebtoken');
var jwtOptions = require('../../config/development/').jwt;

var User = require('../models/User');

var router = express.Router();

/**
 * @api {post} /login JWT authorization
 * 
 * @apiParam  {String} email User email
 * @apiParam  {String} password User password
 * 
 * @apiUse UserWasNotFoundError
 * 
 * @apiError IncorrectPassword 
 * @apiErrorExample {json} Error-Response:
     HTTP/1.1 200 OK
     {
       "error": {
         "message": "Incorrect password."
       }
     }
 *
 * @apiError MissedEmailAnd/OrPassword
 * @apiErrorExample {json} Error-Response:
     HTTP/1.1 400 Bad Request
     {
       "error": {
         "message": "Email and password is required"
       }
     }
 *
 * 
 * @apiSuccess (200) {String} token Jwt token
 * @apiSuccess (200) {Object} userData User data object
 */
router.post('/login', function(req, res) {
	if (req.body.email && req.body.password) {
		var email = req.body.email;
		var password = req.body.password;

		User.findOne({email: email}, function(err, user) {
			if (err || !user) {
				return res.status(404).json({
          error: {
            message: "No such user found."
          }
        });
			} 

			if (!user.checkPassword(password)) {
				return res.status(200).json({
          error: {
            message: "Incorrect password."
          }
        });
      } 
      
      var payload = {_id: user._id, password: password};
      var token = jwt.sign(payload, jwtOptions.secretOrKey);

      // Prevent sending password hash back
      user.password = undefined;
      
      res.json({token: token, user: user});	
		});
	} else {
		res.status(400).json({
      error: {
        message: 'Email and password is required'
      }
		});
	}
});

module.exports = router;
