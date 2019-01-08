const create = {
  name: {
    type: "string",
  },
  apiUserId:{
    type: "string",
  }
}

const add = {
  playlistId: {
    type: "string",
  },
  trackAddress: {
    type: "string",
  }
}

const getOne = {
  id: {
    type: "string",
  },
}

const getAll = {
  apiUserId: {
    type: "string",
  }
}

module.exports = {
  create,
  add,
  getOne,
  getAll
};
