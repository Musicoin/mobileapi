const mongoose = require('./../connections/core');

module.exports = mongoose.model('Playlist', mongoose.Schema({
  name: {
    type: String,
  },
  apiUserId: {
    type: String
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Release',
    unique: true
  }]
}));
