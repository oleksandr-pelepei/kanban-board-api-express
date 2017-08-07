var express = require('express');
var router = express.Router();
var Command = require('../models/Command');

router.get('/commands', function(req, res) {

});

router.post('/command', function(req, res) {

});

router.route('/command/:id')
  .get(function(req, res) {

  })
  .put(function(req, res) {

  })
  .delete(function(req, res) {
    res.send('WORK!');
  });

module.exports = router;