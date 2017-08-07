var express = require('express');
var router = express.Router();
var Attachment = require('../models/Attachment');

router.post('/attachment', function(req, res) {

});

router.route('/attachment/:id')
  .get(function(req, res) {

  })
  .put(function(req, res) {

  })
  .delete(function(req, res) {

  });

module.exports = router;