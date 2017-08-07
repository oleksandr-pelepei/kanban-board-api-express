var express = require('express');
var router = express.Router();

router.use(
  require('./users'),
  require('./attachments'),
  require('./commands'),
  require('./boards'),
  require('./lists'),
  require('./cards')
);

module.exports = router;