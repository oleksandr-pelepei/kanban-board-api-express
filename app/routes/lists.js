var express = require('express');
var List = require('../models/List');
var passport = require('passport');

var router = express.Router();

router.get('/lists/:boardId', passport.authenticate('jwt', { session: false }), function(req, res) {
  List.find({
    board: req.params.boardId
  }, function(err, lists) {
    if (err) {
      res.json({
        error: {
          message: err.message
        }
      });
    }

    res.json(lists);
  });
});

module.exports = router;