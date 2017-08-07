var express = require('express');
var app = express();

// initializations
require('./init/db')();
require('./init/passport-jwt-strategy')();

var routes = require('./app/routes/');


app.use('/', routes);

app.listen(3000, function() {
  console.log('Server is runing');
});