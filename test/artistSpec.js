var assert = require('assert');
const Promise = require('bluebird');
const ArtistModule = require("../js-api/artist");

describe('Artist', function() {
  const mockProfile = {
    descriptionUrl: "descriptionUrl",
    socialUrl: "socialUrl",
    imageUrl: "imageUrl",
  };

  const expected = Object.assign({
    image: "resolvedImageUrl",
    social: {linkedin: "linkedInUrl"},
    description: "Description"
  }, mockProfile);

  const profilesByArist = {};
  const profiles = {};
  const artist1Addr = "artist1";
  const artist1ProfileAddr = "profile1";
  profilesByArist[artist1Addr] = mockProfile;
  profiles[artist1ProfileAddr] = mockProfile;

  const web3Reader = {
    getArtistByOwner: (address) => Promise.resolve(profilesByArist[address]),
    getArtistByProfile: (address) => Promise.resolve(profiles[address]),
  };

  const mediaProvider = {
    readTextFromIpfs: (url) => {
      assert.equal(url, mockProfile.descriptionUrl);
      return Promise.resolve(expected.description);
    },
    readJsonFromIpfs: (url) => {
      assert.equal(url, mockProfile.socialUrl);
      return Promise.resolve(expected.social);
    },
    resolveIpfsUrl: (url) => {
      assert.equal(url, mockProfile.imageUrl);
      return expected.image;
    }
  };

  const musicoinUrl = "http://something";

  const artist = new ArtistModule(web3Reader, mediaProvider, musicoinUrl);
  it('getArtistByOwner should return for artist 1', function() {
    return artist.getArtistByOwner(artist1Addr)
      .then(function(result) {
        assert.deepEqual(result, expected, "Profile is not as expected");
      })
  });

  it('getArtistByProfile should return for profile 1', function() {
    return artist.getArtistByProfile(artist1ProfileAddr)
      .then(function(result) {
        assert.deepEqual(result, expected, "Profile is not as expected");
      })
  });
});