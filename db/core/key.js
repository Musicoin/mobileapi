const mongoose = require('mongoose');

module.exports = mongoose.model('LicenseKeys', mongoose.Schema({
  tx: String,
  key: String,
  licenseAddress: String,
  failed: Boolean
}));