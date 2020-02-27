const mongoose = require('mongoose');

module.exports = mongoose.model('Hero', mongoose.Schema({
  subtitle: String,
  subtitleLink: String,
  title: String,
  titleLink: String,
  image: String,
  licenseAddress: String,
  label: String,
  startDate: Date,
  expirationDate: Date
}));