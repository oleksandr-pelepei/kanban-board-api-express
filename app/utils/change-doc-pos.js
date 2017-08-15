/**
 * For saving card or list position they have pos property wich is 
 * middle value between previous card|list pos and next one
 * 
 * When this value become too small it is necessary change this doc pos and next 
 * one pos to biger value
 * 
 */
module.exports = function(Model, newPosition) {
  var self = this;
  
  return new Promise(function(res, rej) {
    /** If position value is not too small than just set new positon into a document */
    if ( Math.abs(this.pos - newPosition) < 0.1 ) {
      self.pos = newPosition;
      self.save(res);
    } else {
      /** Find previous document */
      Model
      .findOne({
        $query: {
          pos: {
            $lt: newPosition
          }
        },
        $orderby: {
          pos: -1
        }
      })
      .then(function(err, docBeforeCurrent) {
        if (err) {
          return res(err, self);
        }

        /** Find next two documents */
        Model
        .find({
          $query: {
            pos: {
              $gt: newPosition
            }
          },
          $orderby: {
            pos: 1
          }
        })
        .limit(2)
        .exec(function(err, nextTwoDocs) {
          if(err) {
            return res(err, self);
          }
          
          var firstPosition = docBeforeCurrent ? docBeforeCurrent.pos : 0;
          var secondPosition = nextTwoDocs[1] ? nextTwoDocs[1].pos : Math.MAX_VALUE;
          var step = (secondPosition - firstPosition) / 3;

          nextTwoDocs[0].pos = firstPosition + (step * 2);

          nextTwoDocs[0].save(function(err, nextDoc) {
            if (err) {
              return res(err, self);
            }

            self.pos = firstPosition + step;
            self.save(res)
          });
        });
      });
    }
  });
}
