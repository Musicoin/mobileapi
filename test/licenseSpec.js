const assert = require('assert');
const Promise = require('bluebird');
const LicenseModule = require("../js-api/license");
const Lock = require("../components/media/media-lock");

describe('License', function() {
  describe('Success cases', function() {
    it('should return a license with a resolved image', function () {
      const mockLicense = {};
      const expected = {image: "expectedImage"};
      const web3Reader = {loadLicense: (address) => Promise.resolve(mockLicense)};
      const web3Writer = {};
      const mediaProvider = {resolveIpfsUrl: (url) => expected.image};
      const licenseModule = new LicenseModule(web3Reader, web3Writer, mediaProvider);
      return licenseModule.getLicense("address")
        .then(function (l) {
          assert.deepEqual(l, expected, "License did not match expect");
        });
    })

    it('should return a resource stream', function () {
      const mockLicense = {};
      const expected = {some: "resource"};
      const web3Reader = {loadLicense: (address) => Promise.resolve(mockLicense)};
      const web3Writer = {};
      const mediaProvider = {
        resolveIpfsUrl: (url) => "anything",
        getIpfsResource: (url, keyProvider) => Promise.resolve(expected)
      };
      const licenseModule = new LicenseModule(web3Reader, web3Writer, mediaProvider);
      return licenseModule.getResourceStream("address")
        .then(function (l) {
          assert.deepEqual(l, expected, "Did not return the expected resource");
        });
    })

    it('should release a license', function () {
      const input = {
        title: "Title",
        audioResource: "audioResource",
        imageResource: "imageResource",
      };
      const expectedRequest = {
        title: "Title",
        resourceUrl: "resourceUrl",
        imageUrl: "imageUrl",
        metadataUrl: "textUrl"
      };
      const web3Reader = {};
      const credentialsProvider = {};
      const web3Writer = {
        releaseLicenseV5: (request, credsProvider) => {
          assert.equal(expectedRequest.title, request.title);
          assert.equal(expectedRequest.resourceUrl, request.resourceUrl);
          assert.equal(expectedRequest.imageUrl, request.imageUrl);
          assert.equal(expectedRequest.metadataUrl, request.metadataUrl);
          assert.strictEqual(credentialsProvider, credsProvider, "Unexpected credentials provider");
          return Promise.resolve("tx")
        }
      };
      const mediaProvider = {
        upload: (data, provider) => {
          if (data == input.audioResource) return Promise.resolve(expectedRequest.resourceUrl);
          if (data == input.imageResource) return Promise.resolve(expectedRequest.imageUrl);
          throw new Error("Unexpected input");
        },
        uploadText: data => Promise.resolve(expectedRequest.metadataUrl)
      };
      const licenseModule = new LicenseModule(web3Reader, web3Writer, mediaProvider);
      return licenseModule.releaseLicense(input, credentialsProvider)
        .then(function (result) {
          assert.equal(result, "tx", "Did not return the expected tx");
        })
    })
  });
});