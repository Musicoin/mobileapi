const mongoose = require('../connections/core');

module.exports = mongoose.model('Receipt', mongoose.Schema({
  receiptkey: String,
  email: String,
  coins: Number,
  type: String,
  prod: Boolean,
  create_at: Date
}));
