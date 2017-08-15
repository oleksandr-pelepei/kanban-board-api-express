var express = require('express');
var passport = require('passport');
var Command = require('../models/Command');

var router = express.Router();

router.get('/commands', passport.authenticate('jwt', { session: false }), function(req, res) {
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

module.exports = router;