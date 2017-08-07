var express = require('express');
var router = express.Router();
var Card = require('../models/Card');

router.get('/cards', function(req, res) {

});

router.post('/card', function(req, res) {

});

router.route('/card/:id')
  .get(function(req, res) {

  })
  .put(function(req, res) {

  })
  .delete(function(req, res) {

  });

  
router.put('/card/:id/set-after/:prevCardId');

module.exports = router;