var express = require('express');
var router = express.Router();

router.use(
  require('./attachments'),
  require('./commands'),
  require('./boards'),
  require('./lists'),
  require('./cards'),
  require('./users'),
  require('./crud')
);

module.exports = router;