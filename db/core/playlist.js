const mongoose = require('./../connections/core');

module.exports = mongoose.model('Playlist', mongoose.Schema({
  name: {
    type: String,
  },
  user: {
    email: String,
    profileAddress: String,
    name: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    }
  },
  songs: [String]
}));
