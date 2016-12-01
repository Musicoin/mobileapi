var Promise = require('bluebird');
var express  = require('express');
var router = express.Router();
var mediaProvider;

router.get('/:address', function(req, res) {
  mediaProvider.getRawIpfsResource(req.params.hash)
    .then(function(result) {
      res.writeHead(200, result.headers);
      result.stream.pipe(res);
    })
    .catch(function(err) {
      console.error(err.stack);
      res.status(500);
      res.send(err);
    });
});

module.exports.init = function(_mediaProvider) {
  mediaProvider = _mediaProvider;
  return router;
};
