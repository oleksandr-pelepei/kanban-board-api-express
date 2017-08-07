var express = require('express');
var router = express.Router();
var List = require('../models/List');

router.get('/lists/:boardId', function(req, res) {

});

router.post('/list', function(req, res) {

});

router.route('/list/:id')
  .get(function(req, res) {

  })
  .put(function(req, res) {

  })
  .delete(function(req, res) {

  });

  
router.put('/list/:id/set-after/:prevListId');

module.exports = router;