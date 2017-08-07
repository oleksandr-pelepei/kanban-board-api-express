var passport = require('passport');
var passportJWT = require('passport-jwt');
var optJWT = require('../config/development/').jwt;

var JwtStrategy = passportJWT.Strategy;

module.exports = function() {
	var jwtStrategy = new JwtStrategy(optJWT, function(jwt_payload, done) {

		if (jwt_payload._id && jwt_payload.password) {
			done(null, jwt_payload);
		} else {
			done(null, false);
		}

	});

	passport.use(jwtStrategy);
};
