var express = require('express');
var passport = require('passport');
var Board = require('../models/Board');

var router = express.Router();

/**
 * Find all boards current user belongs to
 * @api {get} /boards Search all user boards
 * @apiName GetBoards
 * @apiGroup Boards
 * 
 * @apiPermission AuthorizationRequired
 * 
 * @apiUse NonAuthorizedError
 * 
 * @apiSuccess (200) {Array} boards All user's boards
 *  
 * @apiSuccessExample {json} Success-Response:
   HTTP/1.1 200 OK
   [
    {
        "_id": "598d9a04ee9f8807e8ffeb0b",
        "name": "Board 1",
        "command": "598c31a46e550e230069ed0d",
        "author": "598accadfbfaea2664e1600b",
        "__v": 0,
        "members": [
            "598accc4fbfaea2664e1600c"
        ],
        "background": "#fff",
        "privacy": "public"
    },
    {
        "_id": "598d9a97ee9f8807e8ffeb0c",
        "name": "Board 2",
        "author": "598accc4fbfaea2664e1600c",
        "__v": 0,
        "members": [
            "598accadfbfaea2664e1600b"
        ],
        "background": "#fff",
        "privacy": "public"
    },
    {
        "_id": "598d9c5eee9f8807e8ffeb0e",
        "name": "Board 4",
        "command": "598c31a46e550e230069ed0d",
        "author": "598accc4fbfaea2664e1600c",
        "__v": 0,
        "members": [],
        "background": "#fff",
        "privacy": "public"
    }
  ]
 * 
 */
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

router.get('/board-tree/:id/', passport.authenticate('jwt', { session: false }), function(req, res) {
  Board.findOne({
    _id: req.params.id
  })
  .populate({
    
  })
});

module.exports = router;