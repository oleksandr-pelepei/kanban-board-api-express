var mongoose = require('mongoose');
var dbOptions = require('../config/development/').db;

module.exports = function() {
  mongoose.connect(dbOptions.url, dbOptions.options);
};