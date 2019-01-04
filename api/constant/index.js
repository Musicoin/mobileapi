const TOKEN_TIMEOUT = 7 * 24 * 60 * 60 * 1000;
const TOKEN_LENGTH = 40;
const SECRET_LENGTH = 30;
const IPFS_PROTOCOL = "ipfs://";
const IPFS_BASE_URL = "https://musicoin.org/media/";
const TRACK_BASE_URL = "https://musicoin.org/nav/track/";
const ARTIST_BASE_URL = "https://musicoin.org/nav/artist/";
const PLAY_BASE_URL = "https://a.musicoin.org/track";


module.exports = {
  TOKEN_TIMEOUT,
  IPFS_BASE_URL,
  TRACK_BASE_URL,
  ARTIST_BASE_URL,
  IPFS_PROTOCOL,
  PLAY_BASE_URL,
  TOKEN_LENGTH,
  SECRET_LENGTH
}