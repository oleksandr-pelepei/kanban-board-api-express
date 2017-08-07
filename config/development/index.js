var ExtractJwt = require('passport-jwt').ExtractJwt;

var options = {
  db: {
    url: 'mongodb://localhost/kanban-board',
    options: {
    }
  },
  jwt: {
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: '*(&F_GBfg6767G&*N(gu'
  }
};

module.exports = options;