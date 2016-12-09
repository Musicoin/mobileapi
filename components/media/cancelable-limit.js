const Transform = require('stream').Transform;
const util = require('util');

function Faucet(valve, maxPollCount, options) {
  this.bytesRead = 0;
  this.valve = valve;
  this.pending = [];
  this.maxPollCount = maxPollCount;
  Transform.call(this, options);
}
util.inherits(Faucet, Transform);

Faucet.prototype._transform = function (chunk, enc, cb) {
  // in general, _transform will no be called again until cb() is called
  // so these should not build up.  However, I couldn't find docs to confirm.
  // in any case, add this chuck to the list of pending chunks
  this.pending.push(() => this._flushChunk(chunk, enc, cb));

  // if the valve is open, drain.  Otherwise, make sure we are watching for
  // changes in the valve state.
  this._isValveOpen()
    ? this._drainBuffer()
    : this._monitorValve();
};

Faucet.prototype._drainBuffer = function() {
  this._stopPollingValve();
  while (this.pending.length > 0) {
    this.pending.shift()();
  }
};

Faucet.prototype._flushChunk = function(chunk, enc, cb) {
  console.log("pushing chunk, bytesRead=" + this.bytesRead);
  this.bytesRead += chunk.length;
  this.push(chunk);
  cb();
};

Faucet.prototype._isValveOpen = function() {
  return this.valve(this);
};

Faucet.prototype._monitorValve = function() {
  if (this.monitor) return;
  this.monitor = setInterval(() => this._pollValve(), 2000);
};

Faucet.prototype._pollValve = function() {
  this._isValveOpen()
    ? this._drainBuffer()
    : this._continueWaiting();
};

Faucet.prototype._continueWaiting = function() {
  this.pollCount++;
  if (this.pollCount > this.maxPollCount) {
    this.error = new Error("Max pollCount reached while waiting for valve to open, pollCount: " + this.pollCount);
    this._stopPollingValve();
  }
};

Faucet.prototype._stopPollingValve = function() {
  if (this.monitor) {
    clearTimeout(this.monitor);
    this.monitor = null;
    this.pollCount = 0;
  }
};

module.exports = Faucet;