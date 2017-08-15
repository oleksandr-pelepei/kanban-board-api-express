var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// initializations
require('./init/db')();
require('./init/passport-jwt-strategy')();

var authRoutes = require('./app/auth/');
var apiRoutes = require('./app/routes/');

app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use('/', authRoutes, apiRoutes);

app.listen(3000, function() {
  console.log('Server is runing');
});