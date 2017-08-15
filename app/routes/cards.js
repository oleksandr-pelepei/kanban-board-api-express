var express = require('express');
var passport = require('passport');
var Card = require('../models/Card');

var router = express.Router();

router.get('/cards/:listId', passport.authenticate('jwt', { session: false }), function(req, res) {
  Card.find({
    list: req.params.listId
  }, function(err, cards) {
    if (err) {
      res.json({
        error: {
          message: err.message
        }
      });
    }

    res.json(cards);
  });
});

module.exports = router;