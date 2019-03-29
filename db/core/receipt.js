const mongoose = require('../connections/core');

module.exports = mongoose.model('Receipt', mongoose.Schema({
  receipt: String,
  email: String,
  type: String,
  create_at: Date
}));
