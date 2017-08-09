var express = require('express');
var passport = require('passport');
var bcrypt = require('bcrypt');
var bcryptOptions = require('../../config/development/').bcrypt;

var User = require('../models/User');
var router = express.Router();

router.get('/users/search', function(req, res) {
  res.send('works!');
})

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

router.use('/user/:id', passport.authenticate('jwt', { session: false }));

router.route('/user/:id')
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
  .put(function(req, res) {
    if (req.user._id != req.params.id) {
      return res.status(403).json({
        error: {
          message: 'You cannot modificate this user data.'
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

module.exports = router;