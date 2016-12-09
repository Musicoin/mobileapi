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

  const emptyWeb3Writer = {};

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


  it('getArtistByOwner should return for artist 1', function() {
    const artist = new ArtistModule(web3Reader, emptyWeb3Writer, mediaProvider, musicoinUrl);
    return artist.getArtistByOwner(artist1Addr)
      .then(function(result) {
        assert.deepEqual(result, expected, "Profile is not as expected");
      })
  });

  it('getArtistByProfile should return for profile 1', function() {
    const artist = new ArtistModule(web3Reader, emptyWeb3Writer, mediaProvider, musicoinUrl);
    return artist.getArtistByProfile(artist1ProfileAddr)
      .then(function(result) {
        assert.deepEqual(result, expected, "Profile is not as expected");
      })
  });

  it('fails gracefully when loading social metadata fails', function() {
    const brokenMediaProvider = Object.assign({}, mediaProvider);
    const expectedOutput = Object.assign({}, expected);

    brokenMediaProvider.readJsonFromIpfs = (url) => Promise.reject(new Error("Something when wrong"));
    delete expectedOutput.social;

    const buggyArtist = new ArtistModule(web3Reader, emptyWeb3Writer, brokenMediaProvider, musicoinUrl);
    return buggyArtist.getArtistByProfile(artist1ProfileAddr)
      .then(function(result) {
        // make sure the error was reported in the social object
        assert.ok(result.errors, "Error was not reported");
        assert.deepEqual(result.social, {});

        // now make sure nothing else changed
        delete result.social;
        delete result.errors;
        assert.deepEqual(result, expectedOutput, "Profile is not as expected");
      })
  });

  it('fails gracefully when loading description fails', function() {
    const brokenMediaProvider = override(mediaProvider, {
      readTextFromIpfs: (url) => Promise.reject(new Error("Something when wrong"))
    });

    const expectedOutput = Object.assign({}, expected);
    delete expectedOutput.description;

    const buggyArtist = new ArtistModule(web3Reader, emptyWeb3Writer, brokenMediaProvider, musicoinUrl);
    return buggyArtist.getArtistByProfile(artist1ProfileAddr)
      .then(function(result) {
        // make sure the error was reported in the social object
        assert.ok(result.errors, "Error was not reported");
        assert.equal(result.description, "");

        // now make sure nothing else changed
        delete result.description;
        delete result.errors;
        assert.deepEqual(result, expectedOutput, "Profile is not as expected");
      })
  })

  it('should release a profile', function () {
    const input = {
      artistName: "Artist",
      social: {some: "service"},
      description: "some description",
      imageResource: "imageResource",
    };
    const expectedRequest = {
      artistName: "Artist",
      descriptionUrl: "resourceUrl",
      imageUrl: "imageUrl",
      socialUrl: "socialUrl"
    };
    const web3Reader = {};
    const credentialsProvider = {};
    const web3Writer = {
      releaseArtistProfileV2: (request, credsProvider) => {
        assert.equal(expectedRequest.artistName, request.artistName);
        assert.equal(expectedRequest.descriptionUrl, request.descriptionUrl);
        assert.equal(expectedRequest.imageUrl, request.imageUrl);
        assert.equal(expectedRequest.socialUrl, request.socialUrl);
        assert.strictEqual(credentialsProvider, credsProvider, "Unexpected credentials provider");
        return Promise.resolve("tx")
      }
    };
    const mediaProvider = {
      upload: (data) => {
        if (data == input.imageResource) return Promise.resolve(expectedRequest.imageUrl);
        throw new Error("Unexpected input to upload: " + data);
      },
      uploadText: data => {
        if (data == input.description) return Promise.resolve(expectedRequest.descriptionUrl)
        if (data == JSON.stringify(input.social)) return Promise.resolve(expectedRequest.socialUrl)
        throw new Error("Unexpected input to uploadText: " + data);
      }
    };
    const artistModule = new ArtistModule(web3Reader, web3Writer, mediaProvider, "someUrl");
    return artistModule.releaseProfile(input, credentialsProvider)
      .then(function (result) {
        assert.equal(result, "tx", "Did not return the expected tx");
      })
  })
});

const override = function(src, overrides) {
  return Object.assign({}, src, overrides);
};