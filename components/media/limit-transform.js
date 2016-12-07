const Transform = require('stream').Transform;
const util = require('util');

function Limit(max, options) {
  // allow use without new
  if (!(this instanceof Limit)) {
    return new Limit(options);
  }
  this.maxBytes = max;
  this.bytesRead = 0;
  // init Transform
  Transform.call(this, options);
}
util.inherits(Limit, Transform);

Limit.prototype._transform = function (chunk, enc, cb) {
  if (this.bytesRead < this.maxBytes) {
    this.bytesRead += chunk.length;
    this.push(chunk);
    cb();
  }
};

module.exports = Limit;