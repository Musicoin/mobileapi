var express  = require('express');
var router = express.Router();
var artistModule;

router.get('/detail/:address', function(req, res) {
  artistModule.loadArtist(req.params.address)
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
