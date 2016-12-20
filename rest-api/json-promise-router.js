function JsonPromiseRouter(expressRouter) {
  this.router = expressRouter;
  this.promiseHandler = function handleJsonPromise(p, res) {
    p.then(function (output) {
      res.json(output);
    })
      .catch(function (err) {
        console.log("Request failed: " + err);
        res.status(500);
        res.send(err);
      });
  };
}

JsonPromiseRouter.prototype.post = function() {
  const routeArgs = [...arguments].slice(0, arguments.length-1);
  const promiseProvider = arguments[arguments.length-1];
  this.router.post(...routeArgs, function(req, res, next) {
    this.promiseHandler(promiseProvider(req, res, next), res, next);
  }.bind(this))
};

JsonPromiseRouter.prototype.get = function() {
  const routeArgs = [...arguments].slice(0, arguments.length-1);
  const promiseProvider = arguments[arguments.length-1];
  this.router.get(...routeArgs, function(req, res, next) {
    this.promiseHandler(promiseProvider(req, res, next), res, next);
  }.bind(this))
};

module.exports = JsonPromiseRouter;