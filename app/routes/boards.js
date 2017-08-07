var express = require('express');
var router = express.Router();
var Board = require('../models/Board');

router.get('/boards', function(req, res) {

});

router.route('/board/:id')
  .get(function(req, res) {

  })
  .put(function(req, res) {

  })
  .delete(function(req, res) {

  });

module.exports = router;