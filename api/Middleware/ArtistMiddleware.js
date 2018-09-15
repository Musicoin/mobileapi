const User = require('../../db/core/user');

class ArtistMiddleware {

  isArtist(Request, Response, next) {
    User.findOne({
        profileAddress: {
          $exists: true,
          $ne: null
        }
      })
      .where({
        mostRecentReleaseDate: {
          $exists: true,
          $ne: null
        }
      })
      .where({
        profileAddress: Request.query.clientId
      })
      .exec()
      .then(user => {
        if (user) {
          next();
        } else {
          Response.send({
            success: false
          });
        }
      }).catch(Error => {
        Response.status(400);
        Response.send({
          success: false,
          error: Error.message
        });
      });
  }
}

module.exports = new ArtistMiddleware();
