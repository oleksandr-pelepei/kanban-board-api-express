var express = require('express');
var passport = require('passport');
var Board = require('../models/Board');

var router = express.Router();

router.get('/boards', passport.authenticate('jwt', { session: false }), function(req, res) {
  Board.findUserBoards(req.user, function(err, boards) {
    if (err) {
      return res.json({
        error: {
          message: err.message
        }
      });
    }

    if (!boards) {
      res.json([]);
    }

    res.json(boards);
  });
});

router.post('/board',  passport.authenticate('jwt', { session: false }), function(req, res) {
  req.body.author = req.user._id;

  Board.create(req.body, function(err, board) {
    if (err) {
      return res.json({
        error: {
          message: err.message
        }
      });
    }

    res.json(board);
  });
});

router.route('/board/:id')
  .all( passport.authenticate('jwt', { session: false }) )


  .get(function(req, res) {
    Board.findById(req.params.id, function(err, board) {
      if (err) {
        return res.json({
          error: err.message
        });
      }

      if (!board) {
        return res.status(404).json({
          error: "Such board was not found."
        });
      }

      board.canUserRead(req.user).then(function(result) {
        if (!result) {
          return res.status(403).json({
            error: {
              message: "You have not access to this data."
            }
          });
        }
        
        res.json(board);
      });

    });
  })

  .put(function(req, res) {
    Board.findById(req.params.id, function(err, board) {
      if (err) {
        return res.json({
          error: err.message
        });
      }

      if (!board) {
        return res.status(404).json({
          error: {
            message: "Such board was not found."
          }
        });
      }

      if ( !board.canUserModificate(req.user) ) {
        return res.status(403).json({
          error: {
            message: "You are not allowed modificate this data."
          }
        });
      }

      for (var boardProp in req.body) {
        // atuhor is defined only 1 time 
        if (boardProp == 'author') {
          return res.status(403).json({
            error: {
              message: "You are not allowed modificate this data."
            }
          });
        }

        board[boardProp] = req.body[boardProp];
      }

      board.save(function(err, updatedBoard) {
        if (err) {
          return res.json({
            error: {
              message: err.message
            }
          });
        }

        res.json(updatedBoard);
      });
    });
  })

  .delete(function(req, res) {
    Board.findById(req.params.id, function(err, board) {
      if (err) {
        return res.json({
          error: {
            message: err.message
          }
        });
      }
      
      if (!board) {
        return res.json({});
      }

      if ( !board.canUserModificate(req.user) ) {
        return res.status(403).json({
          error: {
            message: "You are not allowed modificate this data."
          }
        });
      }

      Board.deleteOne({_id: req.params.id}, function(err, operationRes) {
        if (err) {
          return res.json({
            error: {
              message: err.message
            }
          })
        }

        res.json({});
      });
    });
  });

module.exports = router;