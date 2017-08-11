var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// initializations
require('./init/db')();
require('./init/passport-jwt-strategy')();

var apiRoutes = require('./app/routes/');
var authRoutes = require('./app/auth/');

app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use('/', apiRoutes, authRoutes);

app.listen(3000, function() {
  console.log('Server is runing');
});