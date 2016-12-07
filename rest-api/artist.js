const express = require('express');
const router = express.Router();
let artistModule;

router.get('/detail/:address', function(req, res) {
  artistModule.getArtistByOwner(req.params.address)
    .then(function(output) {
      res.json(output);
    })
    .catch(function(err) {
      res.status(500)
      res.send(err);
    })
});

module.exports.init = function(_artistModule) {
  artistModule = _artistModule;
  return router;
};
