var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/User');

router.get('/users/search', function(req, res) {
  res.send('works!');
})

router.post('/user', function(req, res) {

});

router.use('/user/:id', passport.authenticate('jwt', { session: false }));

router.route('/user/:id')
  .get(function(req, res) {
    res.send('works!');
  })
  .put(function(req, res) {

  })
  .delete(function(req, res) {

  });

module.exports = router;