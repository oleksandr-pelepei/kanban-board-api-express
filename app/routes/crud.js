var express = require('express');
var capitalize = require('capitalize');
var passport = require('passport');
var conditional = require('express-conditional-middleware');
var fileExists = require('file-exists');
var path = require('path');

var router = express.Router();

router
.route('/:modelName/(:docId/)?')
.all( 
  conditional(
    function(req, res) {
      return !(req.path == '/user/' && req.method == 'POST');
    }, 
    passport.authenticate('jwt', { session: false } )
  ),
  function(req, res, next) {
    req.temp = {};
    next();
  },
  findModel
)
.get(checkIdParam, findDoc, checkDocPerm, sendDoc)
.post(checkStaticPerm, createDoc, sendDoc)
.put(checkIdParam, findDoc, checkDocPerm, updateDoc, sendDoc)
.delete(checkIdParam, findDoc, checkDocPerm, deleteDoc, sendDoc);

function findModel(req, res, next) {
  var modelName = capitalize.words(req.params.modelName);
  var modelPath = path.dirname( path.dirname(__filename) ) + '\\/models\\/' + modelName;

  if ( !fileExists.sync(modelPath + '.js') ) {
    return res.status(400).json({
      error: {
        message: 'Such model doesn\'t exist'
      }
    });
  }

  var Model = require(modelPath);
  req.temp.Model = Model;

  next();
}

function checkIdParam(req, res, next) {
  if (!req.params.docId) {
    return res.status(400).json({
      error: req.method + ' method require id paramether.'
    });
  }
  next();
}

function checkStaticPerm(req, res, next) {
  var permissionName = 'canUser' + capitalize.words(req.method.toLowerCase());

  if (req.temp.Model[permissionName]) {
    req.temp.Model[permissionName](req.user, req.body).then(function(access) {
      if (!access) {
        return res.status(403).json({
          error: {
            message: 'You have not permissions to do it.'
          }
        });
      }

      next();
    });
  } else {
    next();
  }
}

function checkDocPerm(req, res, next) {
  var permissionName = 'canUser' + capitalize.words(req.method.toLowerCase());

  if (req.temp.doc[permissionName]) {
    req.temp.doc[permissionName](req.user).then(function(access) {
      if (!access) {
        return res.status(403).json({
          error: {
            message: 'You have not permissions to do it.'
          }
        });
      }
      
      next();
    });
  } else {
    next();
  }
}

function createDoc(req, res, next) {
  if (!!req.temp.Model.schema.paths.author && !req.body.author) {
    req.body.author = req.user._id;
  }

  req.temp.Model.create(req.body, function(err, doc) {
    if (err) {
      return res.json({
        error: {
          message: err.message
        }
      });
    }

    req.temp.doc = doc;
    next();
  });
}

function updateDoc(req, res, next) {
  var doc = req.temp.doc;

  for (var prop in req.body) {
    doc[prop] = req.body[prop];
  }

  doc.save(function(err, doc) {
    if (err) {
      return res.json({
        error: {
          message: err.message
        }
      });
    }

    req.temp.doc = doc;
    next();
  });
}

function findDoc(req, res, next) {
  req.temp.Model.findById(req.params.docId, function(err, doc) {
    if (err) {
      return res.json({
        error: err.message
      });
    }

    if (!doc) {
      return res.status(404).json({
        error: {
          message: "Such document was not found."
        }
      });
    }

    req.temp.doc = doc;
    next();
  });
}

function deleteDoc(req, res, next) {
  req.temp.Model.deleteOne({_id: req.params.docId}, function(err, operationRes) {
    if (err) {
      return res.json({
        error: {
          message: err.message
        }
      })
    }

    req.temp.doc = {};
    next();
  });
}

function sendDoc(req, res) {
  res.json(req.temp.doc);
}

module.exports = router;