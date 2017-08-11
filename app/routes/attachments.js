var express = require('express');
var passport = require('passport');
var multer = require('multer');
var fs = require('fs');

var Attachment = require('../models/Attachment');

var router = express.Router();
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
var upload = multer({ storage: storage });

router.use([
  '/attachment',
  '/attachment/:id'
], passport.authenticate('jwt', { session: false }));

/**
 * AttachmentSuccessFields
 * 
 * @apiSuccess {String} _id Attachment id
 * @apiSuccess {String} author Author id
 * @apiSuccess {String} filename Attachment name
 * @apiSuccess {String} destination Folder contain attachment
 * @apiSuccess {String} url Relative url to attachment
 * 
 */

/**
 * @apiDefine AttachmentSuccessCreatedRes 
 * 
 * @apiUse AttachmentSuccessFields
 * 
 * @apiSuccessExample {json} AttachmentSuccessCreatedRes-Response:
   HTTP/1.1 201 Created
   {
    "filename": "1502432581071-fsdfsd.png",
    "destination": "uploads/",
    "author": "598accc4fbfaea2664e1600c",
    "_id": "598d4d45e5dca51880e6a684",
    "url": "uploads/1502432581071-fsdfsd.png"
   }
 */

/**
 * 
 * @apiDefine AttachmentSuccessRes
 *
 * @apiUse AttachmentSuccessFields
 * 
 * @apiSuccessExample {json} AttachmentSuccessRes-Response:
   HTTP/1.1 200 OK
   {
     "filename": "1502432581071-fsdfsd.png",
     "destination": "uploads/",
     "author": "598accc4fbfaea2664e1600c",
     "_id": "598d4d45e5dca51880e6a684",
     "url": "uploads/1502432581071-fsdfsd.png"
   } 
 */
  

/**
 * 
 * @api {post} /attachment Post attachment
 * @apiName PostAttachment
 * @apiGroup Attachment
 * 
 * @apiUse AuthorizationRequired
 * @apiHeader {String} Content-Type=multipart/form-data Accept only multipart form data
 * 
 * @apiParam {File} attachment File form field
 * 
 * @apiPermission AuthorizationRequired
 * 
 * 
 * @apiParamExample  {http} Request-Example:
   POST /attachment HTTP/1.1
   Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

   ------WebKitFormBoundary7MA4YWxkTrZu0gW
   Content-Disposition: form-data; name="attachment"; filename=""
   Content-Type: 


   ------WebKitFormBoundary7MA4YWxkTrZu0gW--
 * 
 * @apiParamExample  {js} Request-Example:
    var data = new FormData();
    data.append("attachment", "fsdfsd.png");

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        console.log(this.responseText);
      }
    });

    xhr.open("POST", "http://localhost:3000/attachment");
    xhr.setRequestHeader("authorization", "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OThhY2NjNGZiZmFlYTI2NjRlMTYwMGMiLCJwYXNzd29yZCI6IjEiLCJpYXQiOjE1MDIzNzY4NTV9.o4N4pNnpIjrBmswSvfpwTBk7mkV28Z7yqrsFSNY2Iqw");
    xhr.setRequestHeader("cache-control", "no-cache");

    xhr.send(data);
 * 
 * @apiUse NonAuthorizedError
 * @apiUse UnpredictedError
 * 
 * @apiError FileUploadingError
 * @apiErrorExample {json} FileUploadingError-Response:
     HTTP/1.1 400 Bad Request
     {
      error: {
        message: 'File uploading error.'
      }
    }
 * 
 * @apiUse AttachmentSuccessCreatedRes
 * 
 */
router.post('/attachment', upload.single('attachment'), function(req, res) {  
  if (!req.file) {
    return res.statusO(400).json({
      error: {
        message: 'File uploading error.'
      }
    });
  }

  var newAttachmentData = {
    filename: req.file.filename,
    destination: req.file.destination,
    author: req.user._id
  };

  Attachment.create(newAttachmentData, function(err, attachment) {
    if (err) {
      return res.json({
        error: {
          message: err.message
        }
      })
    }

    res
      .append('Location', req.get('host') + '/' + attachment.url)
      .status(201)
      .json(attachment.toJSON({virtuals: true}));
  });

});

router.route('/attachment/:id')

  /**
   * 
   * @api {get} /attachment/:id Get attachment
   * @apiName GetAttachment
   * @apiGroup Attachment
   * 
   * 
   * @apiPermission AuthorizationRequired
   * 
   * 
   * @apiParam  {String} id Attachment id
   * 
   * @apiUse NonAuthorizedError
   * @apiUse UnpredictedError
   *
   * @apiUse AttachmentSuccessRes
   * 
   */
  .get(function(req, res) {
    Attachment.findById(req.params.id, function(err, attachment) {
      if (err) {
        return res.json({
          error: err.message
        });
      }

      if (!attachment) {
        return res.status(404).json({
          error: "Such attachment was not found."
        });
      }
      
      res.json(attachment.toJSON({virtuals: true}));
    });
  })

  /**
   * 
   * @api {delete} /attachment/:id Delete attachment
   * @apiName DeleteAttachment
   * @apiGroup Attachment
   *
   *  
   * @apiPermission AuthorizationRequired
   * 
   * @apiParam  {String} id Attachment id
   * 
   * @apiUse NonAuthorizedError
   * @apiUse YouHaveNotAccessToThisDataError
   * @apiUse UnpredictedError
   * 
   * @apiSuccess {Object} object Empty object
   * @apiSuccessExample {json} Success-Response:
       HTTP/1.1 200 OK 
       {}
   */
  .delete(function(req, res) {
    Attachment.findById(req.params.id, function(err, attachment) {
      if (err) {
        return res.json({
          error: err.message
        });
      }

      if (!attachment) {
        return res.status(404).json({
          error: {
            message: "Such attachment was not found."
          }
        });
      }

      // Only author can delete attachment
      if ( !attachment.isAuthor(req.user) ) {
        return res.status(403).json({
          error: {
            message: "You are not allowed modificate this data."
          }
        });
      }

      Attachment.deleteOne({_id: req.params.id}, function(err, operationRes) {
        if (err) {
          return res.json({
            error: {
              message: err.message
            }
          })
        }

        fs.unlink(attachment.url, function() {
          res.json({});
        });
      });
    });
  });

module.exports = router;