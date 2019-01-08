
const ReleaseModel = require('./release-model');

function responseData(data) {
  return {
    id: data._id.toString(),
    name: data.name,
    songs: ReleaseModel.responseList(data.songs)
  }
}

function responseList(data) {
  return data.map(responseData);
}

module.exports = {
  responseData,
  responseList
}