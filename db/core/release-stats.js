const mongoose = require('mongoose');

const ReleaseStatsSchema = mongoose.Schema({
  release: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Release',
    index: true
  },
  startDate: {
    type: Date,
    index: true
  },
  duration: {
    type: String,
    index: true
  },
  playCount: {
    type: Number,
    default: 0
  },
  tipCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  }
})

ReleaseStatsSchema.virtual('totalTipPlayCount').get(function () {
  return this.playCount + this.tipCount
});

module.exports = mongoose.model('ReleaseStats', ReleaseStatsSchema);



