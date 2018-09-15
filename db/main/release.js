const mongoose = require('mongoose');
const connectionMain = require('./../connections/main');

const ReleaseSchema = mongoose.Schema({
  tx: String,
  state: {
    type: String,

    enum: ['pending', 'published', 'error', 'deleted'],
    default: 'pending',
    index: true
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  artistName: String,
  artistAddress: String,
  description: String,
  title: String,
  imageUrl: String,

  genres: [String],
  languages: [String],
  moods: [String],
  regions: [String],

  canReceiveFunds: Boolean,
  directPlayCount: Number,
  directTipCount: Number,
  releaseDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  contractAddress: String, // non-null iff state=published
  errorMessage: String, // non-null iff state=error
  markedAsAbuse: Boolean,
  pendingUpdateTxs: Object,
  votes: Object
});

// create the model for users and expose it to our app
module.exports = connectionMain.model('Release', ReleaseSchema);
