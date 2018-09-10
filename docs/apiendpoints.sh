curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'username=varunram1&email=varunramganesh@gmail.com&password=123456789' "http://35.232.77.81:3000/auth/signup"

{
  "success": true,
  "publicKey": "5b769d9a2088882e67d1c765"
}

curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'email=varunramganesh@gmail.com&password=123456789' "http://35.232.77.81:3000/auth/credentials"

{
  "success": true,
  "apiuser": {
    "clientId": "5b7f94e7dcb73452b7c582c1",
    "clientSecret": "iOWSTmgrCtulcjwue2eF7aZjvlZVUj"
  }
}

curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'email=varunramganesh@gmail.com&password=123456789' "http://35.232.77.81:3000/api/user/delete?clientId=5b769d9a2088882e67d1c765&clientSecret=Q8kuUcJZgugIQOm8mjyCkfHaddCfpV"

{
  "token": "7LUFf34slskv8Acy2cVUdTfBzsb6C4225L5PdA8A9NGgAX4gKiv7ViRI5w2CSob9pfqtfbV1UjBuQ4Wo"
}

curl -X GET -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" "http://35.232.77.81:3000/api/user/delete/verify/7LUFf34slskv8Acy2cVUdTfBzsb6C4225L5PdA8A9NGgAX4gKiv7ViRI5w2CSob9pfqtfbV1UjBuQ4Wo?clientId=5b769d9a2088882e67d1c765&clientSecret=Q8kuUcJZgugIQOm8mjyCkfHaddCfpV"

{
  "success": true
}

curl -X DELETE -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'email=varunramganesh@gmail.com&password=123456789' "http://35.232.77.81:3000/api/user/delete?clientId=5b769d9a2088882e67d1c765&clientSecret=Q8kuUcJZgugIQOm8mjyCkfHaddCfpV"

{
  "success": true,
  "message": "User account was successfully deleted"
}

curl -X GET -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" "http://35.232.77.81:3000/api/user/ismember/5b76a19e2088882e67d1c767?clientId=5b76a19e2088882e67d1c767&clientSecret=bpbGaiLjpbKwYw737nHFrGh6f7XWpt"

{
  "success": true,
  "daysRemaning": 0,
  "membershipLevel": 1
}

curl -X GET -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" "http://35.232.77.81:3000/api/user/info/5b76a19e2088882e67d1c767?clientId=5b76a19e2088882e67d1c767&clientSecret=bpbGaiLjpbKwYw737nHFrGh6f7XWpt"

{
  "createdBy": "0xf527a9a52b77f6c04471914ad57c31a8ae104d71",
  "artistName": "",
  "contractVersion": "v0.3",
  "imageUrl": "",
  "followers": 0,
  "socialUrl": "",
  "tipCount": 0,
  "balance": 0,
  "forwardingAddress": "0x0",
  "descriptionUrl": "",
  "prettyUrl": "",
  "membershipLevel": 1
}

curl -X GET -H "Cache-Control: no-cache" "http://localhost:3000/release/genres?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj"

[
  "Alternative Rock",
  "Ambient",
  "Classical",
  "Country",
  "Dance & EDM",
  "Dancehall",
  "Deep House",
  "Disco",
  "Drum & Bass",
  "Electronic",
  "Folk & Singer-Songwriter",
  "Hip-hop & Rap",
  "House",
  "Indie",
  "Jazz & Blues",
  "Latin",
  "Metal",
  "Piano",
  "Pop",
  "R&B & Soul",
  "Reggae",
  "Reggaeton",
  "Rock",
  "Soundtrack",
  "Techno",
  "Trance",
  "World",
  "Other"
]

curl -X GET -H "Cache-Control: no-cache" "http://35.232.77.81:3000/release/random?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj"

{
  "success": true,
  "data": {
    "title": "Get Up On Min",
    "link": "https://musicion.org/nav/track/0x006b6b89bab636e1ec1cde85d7574af2f69aef10",
    "pppLink": "0x9b08c265945fe7d979fd7f372da9a98da00ca4ae0690353ac1b9790fa45a143c",
    "genres": [
      "Hip-hop & Rap"
    ],
    "author": "LilHayesTV",
    "authorLink": "https://musicoin.org/nav/artist/0xe5987a9dab0212b3bc0d02390a6df80abf1bd398",
    "trackImg": "ipfs://QmVsrwTyoePW4mAR13RkVckxF8bZEtH9iGwgqDVisQffsx",
    "trackDescription": "fire, share with all your friends on all your social media pages.",
    "directPlayCount": 16
  }
}

curl -X GET -H "Cache-Control: no-cache" "http://35.232.77.81:3000/release/random?genre=Rock&clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj"

{
  "success": true,
  "data": {
    "title": "Bird's eye view",
    "link": "https://musicion.org/nav/track/0x3a3e5f2d710da76c778fcf45e96b022cbb83c242",
    "pppLink": "0x924ff742f8dbfa165cc21f2ed3ddd1ec1da4dae717c792cad98dc62349987aab",
    "genres": [
      "Rock",
      "Alternative Rock",
      "Metal"
    ],
    "author": "Orestis Pad",
    "authorLink": "https://musicoin.org/nav/artist/0x4235b2d99ca25aa2512654c6cd9a2404552e7e94",
    "trackImg": "ipfs://QmPPtNxF7un7LTt5M8BC9KrmmvfCkxWnRpuCkxwFKxzD43",
    "trackDescription": "Live recording, no post editing.",
    "directPlayCount": 5
  }
}

curl -X GET -H "Cache-Control: no-cache" "http://35.232.77.81:3000/artist/new?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj"

{
  "success": true,
  "data": [
    {
      "name": "RJCreation's",
      "joinDate": "2018-07-31T05:00:29.144Z",
      "profileLink": "https://musicoin.org/nav/artist/0x29f4c38dc490612124091c8a8c6e41b92e18fafa"
    },
    {
      "name": "Elo The Source",
      "joinDate": "2018-07-30T23:45:52.217Z",
      "profileLink": "https://musicoin.org/nav/artist/0xa8ed58095ad8221254701cba1f7305381ba691b2"
    },
    {
      "name": "David Ryan Harris",
      "joinDate": "2018-07-30T14:44:44.428Z",
      "profileLink": "https://musicoin.org/nav/artist/0xb00557cecceb33fa5fe24c8a47dbad561d53c785"
    },
    {
      "name": "Mokan",
      "joinDate": "2018-07-30T05:00:33.085Z",
      "profileLink": "https://musicoin.org/nav/artist/0x69c500e9b5dc760ac76de17996a39c462745ff27"
    },
    {
      "name": "The Candy Man",
      "joinDate": "2018-07-30T03:30:52.751Z",
      "profileLink": "https://musicoin.org/nav/artist/0xe85f539e21c08896295728aca4bca9d41c455e58"
    },
    {
      "name": "WALTER  SANTOS",
      "joinDate": "2018-07-28T23:43:00.099Z",
      "profileLink": "https://musicoin.org/nav/artist/0xad14b8d4aaa2334d97aec59ca76da5bd95485b1f"
    },
    {
      "name": "Stephan Coleur",
      "joinDate": "2018-07-28T20:59:31.137Z",
      "profileLink": "https://musicoin.org/nav/artist/0xb35dfeacf4dcd75e319ddde6952032c3bcdb0703"
    },
    {
      "name": "Claiton Lemes",
      "joinDate": "2018-07-28T14:30:25.210Z",
      "profileLink": "https://musicoin.org/nav/artist/0xfacb7aa1185804a3f2ecc1e1e672dff7c91d2345"
    },
    {
      "name": "Ravenking Einnarr",
      "joinDate": "2018-07-27T10:37:40.051Z",
      "profileLink": "https://musicoin.org/nav/artist/0xae0fa9683c6fc7958ad16a149ddd7751c5242feb"
    },
    {
      "name": "Rayvanhovenbeatz",
      "joinDate": "2018-07-26T17:06:13.151Z",
      "profileLink": "https://musicoin.org/nav/artist/0x3e64074133b90862fb8cceda860dffa2aa3b69f8"
    },
    {
      "name": "DOMosaurus_Rex",
      "joinDate": "2018-07-26T16:28:42.842Z",
      "profileLink": "https://musicoin.org/nav/artist/0x6bc245e3c8f15509a37e22d3aa4126391b386955"
    },
    {
      "name": "Lazzy Lung",
      "joinDate": "2018-07-26T16:14:48.527Z",
      "profileLink": "https://musicoin.org/nav/artist/0xfc72e50132ae95636710844de62a3d204870e7c8"
    },
    {
      "name": "Samuel Bauer",
      "joinDate": "2018-07-26T16:14:15.779Z",
      "profileLink": "https://musicoin.org/nav/artist/0x3a7936191490fb7394544bea3b7c1be41d8613c9"
    },
    {
      "name": "bitzone",
      "joinDate": "2018-07-26T15:09:40.169Z",
      "profileLink": "https://musicoin.org/nav/artist/0x882e602028bf5d0722a65691c9016c0d6f8047c2"
    },
    {
      "name": "Minibar(d)",
      "joinDate": "2018-07-26T09:24:10.426Z",
      "profileLink": "https://musicoin.org/nav/artist/0xef8963085f8e4146f48fb1d7b909c2b60a370eba"
    },
    {
      "name": "TERMITE",
      "joinDate": "2018-07-26T08:52:04.203Z",
      "profileLink": "https://musicoin.org/nav/artist/0x2d6f9b600c7983820151143f83a0f8a04e37da69"
    },
    {
      "name": "Niksmol",
      "joinDate": "2018-07-26T05:44:46.435Z",
      "profileLink": "https://musicoin.org/nav/artist/0xa3a3b62a95c185c99420d1bf600c9511bfc61b30"
    },
    {
      "name": "MemphisMessiah",
      "joinDate": "2018-07-24T10:46:58.152Z",
      "profileLink": "https://musicoin.org/nav/artist/0x15f124f03270e288ff897e410efacbe8e0896fc3"
    },
    {
      "name": "200 Trio",
      "joinDate": "2018-07-24T06:23:15.732Z",
      "profileLink": "https://musicoin.org/nav/artist/0x3d686159dc4ca9911446f47cad0df3a1053fa6ec"
    },
    {
      "name": "#ILove",
      "joinDate": "2018-07-23T08:14:42.624Z",
      "profileLink": "https://musicoin.org/nav/artist/0x41f6b8b919150c34462cb70c5206aa71454f18a6"
    }
  ]
}

curl -X GET -H "Cache-Control: no-cache" "http://35.232.77.81:3000/release/details/0x8c6cf658952d77c04de98c8a94c7b3b78d785b9f?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj"

{
  "success": true,
  "data": {
    "title": "Chasing for ICO",
    "link": "https://musicion.org/nav/track/0x8c6cf658952d77c04de98c8a94c7b3b78d785b9f",
    "pppLink": "0xb0d926260d4dc5b65fdb0d6d5a1c36f139cb4f3f41e1add6167ecb0dbaa06635",
    "genres": [
      "Beats & Instrumentals"
    ],
    "author": "isaac",
    "authorLink": "https://musicoin.org/nav/artist/0xb1a1ca710934e70e56848328a1ee75e0754c2664",
    "trackImg": "ipfs://QmRDcdvjeXseuxcV7BPEoDt3bL4yxGZgK7VoDjJwgeAgvc",
    "trackDescription": "\"Give me money\"",
    "directTipCount": 57,
    "directPlayCount": 393
  }
}

curl -X GET -H "Cache-Control: no-cache" "http://35.232.77.81:3000/artist/isartist/0xb1a1ca710934e70e56848328a1ee75e0754c2664?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj"

{
  "success": true
}

curl -X GET -H "Cache-Control: no-cache" "http://35.232.77.81:3000/artist/info/0xb1a1ca710934e70e56848328a1ee75e0754c2664?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj"

{
  "totalTips": 1274,
  "totalReleases": 15,
  "totalPlays": 5517
}

curl -X GET -H "Cache-Control: no-cache" "http://35.232.77.81:3000/artist/totaltips/0xb1a1ca710934e70e56848328a1ee75e0754c2664?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj"

{
  "success": true,
  "tipCount": 1274
}

curl -X GET -H "Cache-Control: no-cache" "http://35.232.77.81:3000/artist/totalplays/0xb1a1ca710934e70e56848328a1ee75e0754c2664?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj"

{
  "success": true,
  "playsCount": 5517
}

curl -X GET -H "Cache-Control: no-cache" "http://35.232.77.81:3000/artist/earnings/0xb1a1ca710934e70e56848328a1ee75e0754c2664?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj"

{
  "success": true,
  "tipCount": 1274,
  "playCount": 5517,
  "earned": 6791
}

curl -X GET -H "Cache-Control: no-cache" "http://35.232.77.81:3000/user/stats?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj"

{
  "tie": "Free",
  "calls": 45
}

curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'email=varunramganesh@gmail.com&password=123456789' "http://35.232.77.81:3000/authenticate"

{
  "success": true
}

// MVP4
curl -X GET "http://35.232.77.81:3000/release/upvotes/0x8380864d3d725d36fd08b1d77c1733a736b0a486?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj"

{
  "success": true,
  "message": "There are no votes of this track"
}

curl -X GET -H "Cache-Control: no-cache" "http://35.232.77.81:3000/release/plays/0x8380864d3d725d36fd08b1d77c1733a736b0a486?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj"

{
  "success": true,
  "totalPlays": 1345
}

curl -X GET -H "Cache-Control: no-cache" "http://35.232.77.81:3000/release/tips/0x8380864d3d725d36fd08b1d77c1733a736b0a486?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj"

{
  "success": true,
  "totalTips": 555
}

curl -X GET -H "Cache-Control: no-cache" "http://35.232.77.81:3000/release/bygenre?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&genre=rock"

{
  "success": true,
  "data": [
    {
      "title": "Sir EU x DJ J-$crilla \"OPEN YER MOUTH\" ",
      "link": "https://musicion.org/nav/track/0x2050a3a70de07a3ab4d4cb24916235277e56e02f",
      "pppLink": "0xaedba7f9c9cc697bddcc9bd57190414ccb4951d094d5750252e0309251faaa9c",
      "genres": [
        "rap",
        "hip-hop",
        "rock",
        "Soundtrack"
      ],
      "author": "DJ J-Scrilla",
      "authorLink": "https://musicoin.org/nav/artist/0xadf9a6478c891d3cf5d0c8a15a3f8b025efee88d",
      "trackImg": "ipfs://QmSCcV5mogFHvgkLkf5dVGsUTiQVwLTBrRtFfCCwCofoHk",
      "directPlayCount": 75
    },
    {
      "title": "Egos - Sumerki Idolov",
      "link": "https://musicion.org/nav/track/0x4c67bd48a4a86e109c0c7327b18afe212af330d4",
      "pppLink": "0x9fbdb8e5ab0917ec45bcc1f0cd169724a4fe294ea23cab769aa6fabe83781084",
      "genres": [
        "rock"
      ],
      "author": "Ivan K",
      "authorLink": "https://musicoin.org/nav/artist/0x97b77c5d443d8e266524f18a07a568d29240a0ba",
      "trackImg": "ipfs://QmQTAh1kwntnDUxf8kL3xPyUzpRFmD3GVoCKA4D37FK77C",
      "trackDescription": "",
      "directTipCount": 2,
      "directPlayCount": 266
    },
    {
      "title": "Egos - Vsadnik Smerti",
      "link": "https://musicion.org/nav/track/0xe88baf9f28a5f0ee9623cc47b58da117f6f4c172",
      "pppLink": "0xce56767fa96743615b90ef7dc9ab7c47f0c90020db1615a0c272616eea42c8e8",
      "genres": [
        "rock"
      ],
      "author": "Ivan K",
      "authorLink": "https://musicoin.org/nav/artist/0x97b77c5d443d8e266524f18a07a568d29240a0ba",
      "trackImg": "ipfs://QmQTAh1kwntnDUxf8kL3xPyUzpRFmD3GVoCKA4D37FK77C",
      "trackDescription": "",
      "directTipCount": 1,
      "directPlayCount": 24
    },
    {
      "title": "Egos - Za Gorizont",
      "link": "https://musicion.org/nav/track/0x80e47ae41db8ab6e98970402e876f82f8e85320c",
      "pppLink": "0x64aacb5f0deeb6d60ee71c0199fa67b7c6cf7cea764990d6644baf14c08bc4ac",
      "genres": [
        "rock"
      ],
      "author": "Ivan K",
      "authorLink": "https://musicoin.org/nav/artist/0x97b77c5d443d8e266524f18a07a568d29240a0ba",
      "trackImg": "ipfs://QmQTAh1kwntnDUxf8kL3xPyUzpRFmD3GVoCKA4D37FK77C",
      "trackDescription": "",
      "directPlayCount": 11
    },
    {
      "title": "Egos - Tvoi Svet ",
      "link": "https://musicion.org/nav/track/0xb61f77b7865269df5b79faf85ee92b162c461408",
      "pppLink": "0x2aba73b93dc1a4b5f63807400872f6a2d90567b7e43faa3ec62e6b3300946f33",
      "genres": [
        "rock"
      ],
      "author": "Ivan K",
      "authorLink": "https://musicoin.org/nav/artist/0x97b77c5d443d8e266524f18a07a568d29240a0ba",
      "trackImg": "ipfs://QmQTAh1kwntnDUxf8kL3xPyUzpRFmD3GVoCKA4D37FK77C",
      "trackDescription": "",
      "directTipCount": 1,
      "directPlayCount": 181
    }
  ]
}

curl -X GET -H "Cache-Control: no-cache" "http://35.232.77.81:3000/release/top?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&genre=rock"

{
  "success": true,
  "data": [
    {
      "title": "Woman Don't Cry ",
      "link": "https://musicion.org/nav/track/0x83730788de5b08c7c6993f9beca714f340216fcf",
      "pppLink": "0xfba8576b0831268feba6b790dc799f6adade1e5f452ca7cdd85971c20a86512b",
      "genres": [
        "R&B  raggae"
      ],
      "author": "Amaray ",
      "authorLink": "https://musicoin.org/nav/artist/0x0f8df2e0f5d302407e56e17b81051f03dc4767d4",
      "trackImg": "ipfs://QmQTAh1kwntnDUxf8kL3xPyUzpRFmD3GVoCKA4D37FK77C",
      "directTipCount": 139105,
      "directPlayCount": 2699
    },
    {
      "title": "I Need",
      "link": "https://musicion.org/nav/track/0x442ab5b71fd27aa9e8f3212a5fc695176bf4c6e2",
      "pppLink": "0x2a5c9da13a936bbffaa288ec2c9a91c7c64a5804a1cb0b6e4ed05bc3fc45c0c3",
      "genres": [
        "Hip-hop & Rap",
        "R&B & Soul"
      ],
      "author": "Pain United with Passion",
      "authorLink": "https://musicoin.org/nav/artist/0x65af0decd4aa294bd787e2fecb4dfdee5d733940",
      "trackImg": "ipfs://Qme7c8sgNycBS2tAAiCjSYKdfFvd1pNyqZNhT7M6HmaunJ",
      "trackDescription": "Thanks to You (Listener) , Musicoin, 4Unity Community Corp, & Crypto Kingz for making this happen. The #Food4U Campaign is officially over. The Event is held July 21st 2018. Be on the lookout for video footage on Crypto Kingz Youtube Channel.\r\n\r\nRecap:\r\nFor Unity Community Corporation will utilize Musicoin’s blockchain based music streaming platform which pays per play as a fundraising tool to relaunch the Food4U & Resource program. The inspiring and motivational track “I Need” will be the song used in this campaign, which empower not only the local community but people around the world who want to contribute to a good cause without the financial burden. All you have to do is press play to listen to “I Need” on Musicoin, and the blockchain does the rest. It will pay for the play, and For Unity will use the funds to host Food4U events, which will provide free food and mental health resources for the homeless in the city of Hartford. Our goal is to reach 1 Million plays for “I Need” on Musicoin by July 1st 2018. \r\n\r\n",
      "directTipCount": 29048,
      "directPlayCount": 3899
    },
    {
      "title": "TIME TO FLY TAKE 2 - KRISG184 - FT. KRIS T REEDER",
      "link": "https://musicion.org/nav/track/0x9bb6a64a3785309b1ab0c7e53ad18d74f022acfa",
      "pppLink": "0x316ac5487c42b66107f1b4b9a97faf6b1c292f10fe628b9daac8a36335495e94",
      "genres": [
        "Electronic",
        "House",
        "Drum & Bass",
        "Dance & EDM",
        "Jazz & Blues"
      ],
      "author": "KRISG184",
      "authorLink": "https://musicoin.org/nav/artist/0x8e8bba22679ffb211c28f33834199812279962f2",
      "trackImg": "ipfs://QmadzYvkLCsaTcg5do41zxDbpTziAKBS7RD4GLcvdWZWVi",
      "trackDescription": "TIME TO FLY TAKE 2 - KRISG184 - FT. KRIS T REEDER ###RE-RELEASE###\r\n\r\nFT. KRIS T REEDER (Trombone Creative)",
      "directTipCount": 24493,
      "directPlayCount": 395
    },
    {
      "title": "Everytime",
      "link": "https://musicion.org/nav/track/0x05f50a45366b6c7ba03cd88d976e952eda195d51",
      "pppLink": "0xaaa7b36975045d94320a59586c9de8860fa89693cf8e73ab76a2b4f1b0a2ec72",
      "genres": [
        "Indie",
        "Hip-hop & Rap",
        "Alternative Rock",
        "Experimental",
        "Indie electronic"
      ],
      "author": "Fuzz Heady",
      "authorLink": "https://musicoin.org/nav/artist/0x4a4c94e6bf3e8ca23e28b7cb3e21540a9a2bd8ff",
      "trackImg": "ipfs://QmetaWLvVAFT28kKArfcEkxACyBFHFxJepoPNDAGVxtckF",
      "trackDescription": "I'm looking to collaborate with fellow artists here on Musicoin. I do 50/50 splits here on Musicoin so lets get creative.. Email me at fuzzheadymusic@gmail.com or @fuzzheady on Twitter",
      "directTipCount": 18852,
      "directPlayCount": 5089
    },
    {
      "title": "PRESS ENTER - KRISG184 - FT. KRIS T REEDER",
      "link": "https://musicion.org/nav/track/0x15d27c5f4dfe016998b7c73129e012e22b739a41",
      "pppLink": "0xc7c2774e8443c685d0320d1b1b89cc5ce1f6ead376cceef83295f5e1673a9dd9",
      "genres": [
        "Electronic",
        "House",
        "Drum & Bass",
        "Dance & EDM"
      ],
      "author": "KRISG184",
      "authorLink": "https://musicoin.org/nav/artist/0x8e8bba22679ffb211c28f33834199812279962f2",
      "trackImg": "ipfs://QmPJZ7GiNd3bTDhv8XyAt2tgW8KHq1uJkMgT2pt6aq8zpd",
      "trackDescription": "PRESS ENTER - KRISG184\r\n\r\nFT. KRIS T REEDER (Trombone Creative)",
      "directTipCount": 11489,
      "directPlayCount": 233
    },
    {
      "title": "Basic Freedom - KRISG184 - Ft. Kris T Reeder",
      "link": "https://musicion.org/nav/track/0xbb5c7d3209dbb082dd890c53e0e430d4aab9e285",
      "pppLink": "0x3d846fdb21002533598f04b005e1c1fb363a2762d98f8626184b4c02d02c39f4",
      "genres": [
        "Jazz & Blues",
        "free jazz"
      ],
      "author": "KRISG184",
      "authorLink": "https://musicoin.org/nav/artist/0x8e8bba22679ffb211c28f33834199812279962f2",
      "trackImg": "ipfs://QmXj67xvxvcJmm3hYAFyxFrNzmFZFbDCVG49TNuiUBe6UD",
      "trackDescription": "Basic Freedom - KRISG184 Ft. Kris T Reeder (Trombone)",
      "directTipCount": 11005,
      "directPlayCount": 33
    },
    {
      "title": "Sand Man",
      "link": "https://musicion.org/nav/track/0xe4b298e0373593028765a30bb7b265b1d8fed9de",
      "pppLink": "0x19f8f32de75e0018ec9942d00b789f18d8c18c57c9e28f4ae9a5f0b0327c1b73",
      "genres": [
        "Pop",
        "Indie",
        "Electronic"
      ],
      "author": "Real Lauren Stone",
      "authorLink": "https://musicoin.org/nav/artist/0x8e6eaa8bee00b33a8d36fe16991edc89b2902c48",
      "trackImg": "ipfs://QmfNHe7hmoZ1gtjNSzBaf4VoMc16c8UgVCVy87E3SjnK57",
      "trackDescription": "A song I write about sleeping over the depression. It went #5 on Beatport which was pretty cool for me. If you like the song come find out what else I have going on www.facebook.com/laurenstoneofficial ",
      "directTipCount": 9160,
      "directPlayCount": 1557
    },
    {
      "title": "The Watcher Feat. Fuzz Heady",
      "link": "https://musicion.org/nav/track/0x72008a9156ce24302ed078ffb7208120064e72cb",
      "pppLink": "0x95cf5184b5912da29a1f95c44f9b1eefc5293d3d33aaf89e3c3535addc3c87e6",
      "genres": [
        "Electronic Rock",
        "dubstep",
        "Electronic",
        "Dance & EDM",
        "Jamband",
        "Experimental"
      ],
      "author": "The Maniac Agenda",
      "authorLink": "https://musicoin.org/nav/artist/0xd276489463d3f3719a99090268ca7fd96edb813e",
      "trackImg": "ipfs://QmQfGKLrgGFYcvvL6pZQLsr5YnjisTzg5kEo57tiDgvzec",
      "trackDescription": "Monster Collab With Fuzz Heady! Bluesy Guitars with a bass drop that is the .01% that lysol can't clean....\r\nIf you like our sounds download our remix album: http://www.maniacmusic.net/music",
      "directTipCount": 8118,
      "directPlayCount": 2640
    },
    {
      "title": "DANCE ONE - KRISG184",
      "link": "https://musicion.org/nav/track/0x0aef23b980688fd2d23479c3d6869fd2e000b807",
      "pppLink": "0x0fd3550c89f16d3a321c5039e5df547150e1263287d1c3fb7166f0b7bb645e4f",
      "genres": [
        "Electronic",
        "House",
        "Drum & Bass",
        "Dance & EDM"
      ],
      "author": "KRISG184",
      "authorLink": "https://musicoin.org/nav/artist/0x8e8bba22679ffb211c28f33834199812279962f2",
      "trackImg": "ipfs://QmUp7A4GLcPbpBy6Hw4HVnMyPd7b6Knt6vHk4oTjfY464f",
      "trackDescription": "DANCE ONE - KRISG184",
      "directTipCount": 7380,
      "directPlayCount": 282
    },
    {
      "title": "England I Still Believe",
      "link": "https://musicion.org/nav/track/0xe05d08d69dbc98044ef82b2a1084249c097f7c81",
      "pppLink": "0xa964f0e6e8c49b315aac978d623b18594b76e751887324a3c23e88b378853d3a",
      "genres": [
        "Pop"
      ],
      "author": "Scouting For Girls",
      "authorLink": "https://musicoin.org/nav/artist/0xcb2501ce4061226d471e26d7a897058d1f528d64",
      "trackImg": "ipfs://QmWH5ZR1vvvHVdiXN1J4KY46sWuVEniByXGJvXyo3CMMMu",
      "trackDescription": "Scouting For Girls release their World Cup single ‘England I Still Believe’ ",
      "directTipCount": 7279,
      "directPlayCount": 3283
    }
  ]
}

curl -X GET -H "Cache-Control: no-cache" "http://35.232.77.81:3000/release/recent?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&limit=1"

{
  "success": true,
  "data": [
    {
      "artistName": "Ryme",
      "artistProfile": "https://musicoin.org/nav/artist/0x3e612fcd22df8542dd3bd2d3f278ffea790a9aa9",
      "trackURL": "https://musicion.org/nav/track/0x4df1ea60df897ed2ce60edf89307e73c300f69f4"
    }
  ]
}

curl -X GET -H "Cache-Control: no-cache" "http://35.232.77.81:3000/artist/ofweek?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&limit=1"

{
  "success": true,
  "data": [
    {
      "artistName": "danp",
      "artistAddress": "http://musicoin.org/nav/artist/0xc4c750a6d4676e27b5d4c78a1b3172a543021fe1"
    }
  ]
}

curl -X POST -H "Content-Type: application/json" -H "Cache-Control: no-cache" -d '{
    "name": "TESTPLAYSL",
    "user": {
        "email":"varunramganesh@gmail.com",
        "password": "123456789"
    },
    "songs": ["0x8c6cf658952d77c04de98c8a94c7b3b78d785b9f", "0x7f8b75484bbd857c72dab1574181051cea091923"]
}' "http://35.232.77.81:3000/user/playlist?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&limit=1"

{
  "success": true,
  "playlistName": "TESTPLAYSL",
  "playlistUrl": "http://musicoin.org/playlist/TESTPLAYSL",
  "creatorName": "varunram",
  "creatorUrl": "http://musicoin.org/artist/nav/undefined"
}

curl -X GET -H "Content-Type: application/json" -H "Cache-Control: no-cache" "http://35.232.77.81:3000/user/playlist/TESTPLAYSL?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&limit=1"

{
  "success": true,
  "playlistName": "TESTPLAYSL",
  "playlistUrl": "http://musicoin.org/playlist/TESTPLAYSL",
  "creatorName": "varunram",
  "creatorUrl": "http://musicoin.org/artist/nav/undefined"
}

curl -X DELETE -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'username=varunram&password=123456789' "http://35.232.77.81:3000/user/playlist/TESTPLAYSL?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&limit=1"

{
  "success": true,
  "playlistName": "TESTPLAYSL",
  "playlistUrl": "http://musicoin.org/playlist/TESTPLAYSL",
  "creatorName": "varunram",
  "creatorUrl": "http://musicoin.org/artist/nav/undefined"
}

// 10 endpoints till here as part of MVP4
// developers.musicoin.org updated until here
curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d 'tip=1' "http://35.232.77.81:3000/release/tip/0x8c6cf658952d77c04de98c8a94c7b3b78d785b9f?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&limit=1"

{
  "success": true,
  "tipCount": 59
}

// MVP5 endpoints, 6 endpoints

curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'artistName=isaac' "http://35.232.77.81:3000/search?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&limit=1"

{
  "success": true,
  "data": {
    "user": {},
    "releases": [
      {
        "title": "test",
        "link": "https://musicion.org/nav/track/0x054ca773633cf3c9c004f7c42b878234cec7dc87",
        "pppLink": "0x17f4af4dfcd7823ae70a08c2c3a427211f24520a79d2d7421d4bdcc366b3c1b4",
        "genres": [
          "Ai"
        ],
        "author": "isaac",
        "authorLink": "https://musicoin.org/nav/artist/0xb1a1ca710934e70e56848328a1ee75e0754c2664",
        "trackImg": "ipfs://Qmf4uKKTz2fT7eddt4uNWbkmdyYkudepSMXFJZg1jX2DTH",
        "trackDescription": "test track, don't play"
      },
      {
        "title": "test",
        "link": "https://musicion.org/nav/track/0x2e86fbe6fe9a80373373779fafeeefe7b52ae662",
        "pppLink": "0x717338549c0329f6e7519b02234f5f4cbcbed73e922236dfa46866bc3245751d",
        "genres": [
          "Rock"
        ],
        "author": "isaac",
        "authorLink": "https://musicoin.org/nav/artist/0xb1a1ca710934e70e56848328a1ee75e0754c2664",
        "trackImg": "ipfs://Qmf4uKKTz2fT7eddt4uNWbkmdyYkudepSMXFJZg1jX2DTH",
        "trackDescription": "test don't play"
      },
      {
        "title": "Chasing for ICO",
        "link": "https://musicion.org/nav/track/0xccf366704fa708ca71ae9e913a4329a29e8c18c9",
        "pppLink": "0xe2795f17eb089e8f25d5d94fac7f11946a0db7fe60bfca515b431cb8ad33aaca",
        "genres": [
          "Instruments"
        ],
        "author": "isaac",
        "authorLink": "https://musicoin.org/nav/artist/0xb1a1ca710934e70e56848328a1ee75e0754c2664",
        "trackImg": "ipfs://QmfXY18C1M7iXEVsdq5SyrvJcGTfXJqpL6wFaFHfnB4zRK",
        "trackDescription": "\"Give me money\" "
      },
      {
        "title": "Rushing for ICO",
        "link": "https://musicion.org/nav/track/0x2dbe448155e9845bdb4c877ecd8eaef2564e08d2",
        "pppLink": "0x99a2fc2d1022a234c27c01eceb25dca9399a03a513e99dde46db39e3ef63a198",
        "genres": [
          "Beats & Instrumentals"
        ],
        "author": "isaac",
        "authorLink": "https://musicoin.org/nav/artist/0xb1a1ca710934e70e56848328a1ee75e0754c2664",
        "trackImg": "ipfs://QmRDcdvjeXseuxcV7BPEoDt3bL4yxGZgK7VoDjJwgeAgvc",
        "trackDescription": "\"Give me money\""
      },
      {
        "title": "Chasing for ICO",
        "link": "https://musicion.org/nav/track/0x8c6cf658952d77c04de98c8a94c7b3b78d785b9f",
        "pppLink": "0xb0d926260d4dc5b65fdb0d6d5a1c36f139cb4f3f41e1add6167ecb0dbaa06635",
        "genres": [
          "Beats & Instrumentals"
        ],
        "author": "isaac",
        "authorLink": "https://musicoin.org/nav/artist/0xb1a1ca710934e70e56848328a1ee75e0754c2664",
        "trackImg": "ipfs://QmRDcdvjeXseuxcV7BPEoDt3bL4yxGZgK7VoDjJwgeAgvc",
        "trackDescription": "\"Give me money\"",
        "directTipCount": 59,
        "directPlayCount": 393
      },
      {
        "title": "test track from dev, don't follow",
        "link": "https://musicion.org/nav/track/0x3097a527d60f8c9a000e5be5f8b26fc831c524b9",
        "pppLink": "0x870df1cc6919bdce17054d236be7f6d20ff5b4635e55fedd65c1a01d686c0c1a",
        "genres": [],
        "author": "isaac",
        "authorLink": "https://musicoin.org/nav/artist/0xb1a1ca710934e70e56848328a1ee75e0754c2664",
        "trackImg": "ipfs://QmUcpfHeekUnRLcV5XYW8XthFm7FoZzJsj3J7h4YPoqMnL",
        "trackDescription": "",
        "directPlayCount": 1
      },
      {
        "title": "dev test",
        "link": "https://musicion.org/nav/track/0x3215e93e7541da352dcc42b809b7c2bceedacac5",
        "pppLink": "0xcbbe2f5373bd5e1558e09d62e96b2be7a6a4c681a7d22e371412fccd928c7d80",
        "genres": [
          "Drum & Bass"
        ],
        "author": "isaac",
        "authorLink": "https://musicoin.org/nav/artist/0xb1a1ca710934e70e56848328a1ee75e0754c2664",
        "trackImg": "ipfs://QmfXY18C1M7iXEVsdq5SyrvJcGTfXJqpL6wFaFHfnB4zRK",
        "trackDescription": "dev test, don't play"
      }
    ]
  }
}

1B. curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'profileAddress=0xa41f0291b4466c28f4430512492cd9a06fb76b2c' "http://35.232.77.81:3000/search?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&limit=1"

{
  "success": true,
  "data": {
    "user": {
      "totalTips": 0,
      "totalFollowers": 4,
      "totalReleases": 4,
      "totalPlays": 40,
      "name": "VG",
      "artistURL": "https://musicoin.org/nav/artist/0xa41f0291b4466c28f4430512492cd9a06fb76b2c"
    },
    "releases": []
  }
}

1C. curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'local.email=varunram@musicoin.org' "http://35.232.77.81:3000/search?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&limit=1"

{
  "success": true,
  "data": {
    "user": {},
    "releases": []
  }
}

1D. curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'draftProfile.artistName=isaac' "http://35.232.77.81:3000/search?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&limit=1"

{
  "success": true,
  "data": {
    "user": {},
    "releases": []
  }
}

1E. curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'directTipCount=100' "http://35.232.77.81:3000/search?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&limit=1"
1F. curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'hideProfile=true' "http://35.232.77.81:3000/search?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&limit=1"
1G. curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'google.email=varunram@musicoin.org' "http://35.232.77.81:3000/search?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&limit=1"
1H. curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'AOWBadge=true' "http://35.232.77.81:3000/search?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&limit=1"
1I. curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'directTipCount=123' "http://35.232.77.81:3000/search?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&limit=1"
1J. curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'genres=Rock' "http://35.232.77.81:3000/search?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&limit=1"
1K. curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'artistName=Isaac Mao' "http://35.232.77.81:3000/search?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&limit=1"
1L. curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'directPlayCount=49' "http://35.232.77.81:3000/search?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&limit=1"


2. curl -X GET -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" "http://35.232.77.81:3000/tx/history/0xa41f0291b4466c28f4430512492cd9a06fb76b2c?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj&limit=1"

3. curl -X GET -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" "http://35.232.77.81:3000/user/balance/0xb03280704dfa5e54f33efb989c39ce0226b30350?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj"

{
  "success": true,
  "balance": 76330.01566096062
}

4. curl -X GET -H "Cache-Control: no-cache" "http://35.232.77.81:3000/tx/status/0x17e09a88f35b585ad42882ff19b359def20b09556b62a98f0360f0b2bdf3d3ed?clientId=5b7f94e7dcb73452b7c582c1&clientSecret=iOWSTmgrCtulcjwue2eF7aZjvlZVUj"

{
  "confirmed": true,
  "confirmNumber": 19860
}

5. curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'publicKey=0x2f56d753e4f10f2c88e95c5c147f4f2498beda17&txReceipt=0x17e09a88f35b585ad42882ff19b359def20b09556b62a98f0360f0b2bdf3d3ed' "http://35.232.77.81:3000/user/renew?clientId=5b7d4b7a0b9d416f484d91c5&clientSecret=GEDweFmgXmhbV9QTjUFONqyCcy3aJb"

{
  "success": false,
  "message": "Block height greater then 1000"
}
