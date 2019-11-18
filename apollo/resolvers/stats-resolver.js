let statscount = {plays: 6781650, tips: 4380785};

async function stats(parent, args, context, info) {
  return statscount;
}

async function increasePlays(_parent, _args, _context, _info) {
  statscount.plays = statscount.plays + 1;
  return statscount;
}

module.exports = {
  Query: {
    stats
  },
  Mutation: {
    increasePlays
  },
};