Musicoin core
===============

To get setup, run `npm install`

Currently, this package assumes IPFS, Geth/Parity, and MongoDB are already running.  

You can start it like this:

`node rest-api/app.js --ipfsHost http://localhost:8080 --web3Host http://localhost:8545`

You can get license details like this:

http://localhost:3000/getLicense/0x92e853935f8588956057ba87866fc6d58c82ba72

or stream a media file like this:

http://localhost:3000/media/0x92e853935f8588956057ba87866fc6d58c82ba72

## Search
- POST - /search
- BODY
	- all fields from `user` and `release` model
- QUERY 
	- `clientId`, `clientSecret`
- Example:
	- Request: BODY - `artistName` = danp
	- Response:
```javascript
{
    "success": true,
    "data": {
        "user": {},
        "releases": [
            {
                "title": "Sample track",
                "link": "https://musicion.org/nav/track/0x79f707c8090b428028851698ae995d18ac3da9f0",
                "pppLink": "0x86412ea81b7fb86ecc673779f989aaaa175ddcd64000a71737429b41832d3b7d",
                "genres": [
                    "Piano",
                    "Indie",
                    "Folk & Singer-Songwriter"
                ],
                "author": "danp",
                "authorLink": "https://musicoin.org/nav/artist/0xc4c750a6d4676e27b5d4c78a1b3172a543021fe1",
                "trackImg": "ipfs://QmNQ7ysN6B9zjRGNoEB3Gpk7VyNB4dni3m8sUSqQPDVq6a",
                "trackDescription": "This is just a sample",
                "directPlayCount": 1
            },
            {
                "title": "Testing",
                "link": "https://musicion.org/nav/track/0x8f34a72dcdabb5df2b1f3daadca0a0dfbdab773f",
                "pppLink": "0x69506f6b8a315daf3d298a3f919f3c90f829a22c33e898395f704f57b409b2c4",
                "genres": [
                    "Piano",
                    "Indie",
                    "Folk & Singer-Songwriter"
                ],
                "author": "danp",
                "authorLink": "https://musicoin.org/nav/artist/0xc4c750a6d4676e27b5d4c78a1b3172a543021fe1",
                "trackImg": "ipfs://QmaXfH1ACwNv3FXoqZ9XxEJHg98PBZ1n3n2qJdCf5EoGVA",
                "directPlayCount": 1
            },
            {
                "title": "Our Times",
                "link": "https://musicion.org/nav/track/0x01d8b96f87e99b123a2c7928120ee3530011ed49",
                "pppLink": "0xb47fa47e554764b568228a32fd7c222f6ef274dcfb9a17751dedb99e4b32ba4e",
                "genres": [
                    "Piano"
                ],
                "author": "danp",
                "authorLink": "https://musicoin.org/nav/artist/0xc4c750a6d4676e27b5d4c78a1b3172a543021fe1",
                "trackImg": "ipfs://QmUkznRBiJ4VXnYrCJ72htJWamxcfLmtWfajfgZdcrJAkG",
                "trackDescription": "This is one of the few pieces that I've actually recorded.  I wrote it when I was in college and only a handful of people ever heard it.  I recorded it to be used at my sister's wedding (because there as no way I was going to play it live), which is where this recording originally came from.  Enjoy!",
                "directTipCount": 42,
                "directPlayCount": 112
            }
        ]
    }
}
```


## Transaction API

### Get transaction history
- GET - /tx/history/:address
- PARAMS
	- `address` - user publicKey (required)
- QUERY 
	- `clientId`, `clientSecret`
- Response Array: 
```javascript
[
	{
	    txid: String,
	    from: String,
	    gas: Number,
	    to: String,
	    date: Date,
	    amount: Number,
	    paymentDate: Timestamp,
	    blockHeight: Number,
	    confirmNumber: Numberr,
	    link: String
	  }
]
```

### Get transaction status
- GET - /tx/status/:txHash
- QUERY 
	- `clientId`, `clientSecret`
- Response Object:
```javascript
{
    "confirmed": Boolean,
    "confirmNumber": Number
}
```

## User API

### Get user balance
- GET - /user/balance/:address
- QUERY 
	- `clientId`, `clientSecret`
- Response Object:

```javascript
{
    "success": Boolean,
    "balance": Number
}
```
### Renew member
- POST - /user/renew
- BODY 
	- `publicKey` - required,
	- `txReceipt` - required
- QUERY 
	- `clientId`, `clientSecret`
- Response Object:
```javascript
{
    "success": Boolean,
    "days": Number,
    "membershipLevel": Number,
    "name": String,
    "artistURL": String
}
```
### Create playlist
- POST - /user/playlist
- BODY
```javascript
  {
	"name": String,
	"user": {
		"email": String,
		"password": String
	},
	"songs": Array // of contractAddresses of songs
  }
```
- QUERY 
	clientId, clientSecret
- Reponse Object: 
```javascript
  {
    "success": Boolean,
    "playlistName": String,
    "playlistUrl": String,
    "creatorName": String,
    "creatorUrl": String
  }
```
### Get playlist
- GET - /user/playlist/{name}
- PARAMS 
	- `name` - name of playlist (required)
- QUERY 
	clientId, clientSecret
- Response object: 
```javascript
  {
    "success": Boolean,
    "playlistName": String,
    "playlistUrl": String,
    "creatorName": String,
    "creatorUrl": String
  }
```

### Delete playlist 
- DELETE - /user/playlist/{name}
- PARAMS 
	- name - name of playlist (required)
- BODY
	- `username` - name of user who create this playlist (required)
	- `password` - (required)
- QUERY 
	- clientId, clientSecret
- Response object: 
```javascript
  {
    "success": Boolean,
    "playlistName": String,
    "playlistUrl": String,
    "creatorName": String,
    "creatorUrl": String
  }
```

## Releases API

### get Track UpVotes
- GET - /release/upvotes/{contractAddress}
- PARAMS
	 - `contractAddress` - contractAddress of track
- QUERY 
	 - clientId, clientSecret
- Response Onject:
```javascript
{
    "success": Boolean,
    "upVotes": Number
}
```
### Get Track Plays
- GET - /release/plays/{contractAddress}
- PARAMS
	- `contractAddress` - contractAddress of track
- QUERY 
	clientId, clientSecret
- Response Onject:
```javascript
{
    "success": Boolean,
    "plays": Number
}
```
### Get Track Tips
- GET - /release/tips/{contractAddress}
- PARAMS
	 - `contractAddress` - contractAddress of track
- QUERY 
	clientId, clientSecret
- Response Onject:
```javascript
{
    "success": Boolean,
    "tips": Number
}
```

### Get Tracks By Genre
- GET - /release/bygenre
- QUERY 
	 - clientId, clientSecret,
	 - `genre` - String (required)
	 - `limit` - Number (optional)
- Response Onject:
```javascript
{
    "success": Boolean,
    "data": [
   	{
            "title": String,
            "link": String,
            "pppLink": String,
            "genres": Array,
            "author": String,
            "authorLink": String,
            "trackImg": String,
            "directTipCount": Number,
            "directPlayCount": Number
        } 
    ]
}
```

### Get Top Tracks
- GET - /release/top
- QUERY 
	 - clientId, clientSecret,
	 - `limit` - Number (optional)
- Response Onject:
```javascript
{
    "success": Boolean,
    "data": [
   	{
            "title": String,
            "link": String,
            "pppLink": String,
            "genres": Array,
            "author": String,
            "authorLink": String,
            "trackImg": String,
            "directTipCount": Number,
            "directPlayCount": Number
        } 
    ]
}
```

### Get Recent Tracks
- GET - /release/recent
- QUERY 
	 - clientId, clientSecret,
	 - `limit` - Number (optional)
- Response Onject:
```javascript
{
    "success": Boolean,
    "data": [
   	{
            "title": String,
            "link": String,
            "pppLink": String,
            "genres": Array,
            "author": String,
            "authorLink": String,
            "trackImg": String,
            "directTipCount": Number,
            "directPlayCount": Number
        } 
    ]
}
```

### Tip Track
- POST - /release/tip/{contractAddress}
- BODY
	 - `tip` - Number (required)
- QUERY 
	 - clientId, clientSecret
- Response Onject:
```javascript
{
    "success": Boolean,
    "tipCount": Number 
}
```

### Get genres

- GET - /release/genres
- QUERY 
	- clientId, clientSecret

- Response Array:
``` javascript

['Genre name', ...]

```

### Release details

- GET - /release/details/{id};
- PARAMS 
	id - _id of track;
- QUERY 
	clientId,clientSecret

- Response Object: 
``` javascript

    "success": Boolean,
    "data": {
        "title": String,
        "link": String,
        "pppLink": String,
        "genres": Array,
        "author": String,
        "authorLink": String,
        "trackImg": String,
        "trackDescription": String,
        "directTipCount": Number,
        "directPlayCount": Number
    }

```

### Release random

- GET - /release/random
- QUERY 
	genre - genre for search tracks (optional)
	clientId,clientSecret

Response Object: 
``` javascript

    "success": Boolean,
    "data": {
        "title": String,
        "link": String,
        "pppLink": String,
        "genres": Array,
        "author": String,
        "authorLink": String,
        "trackImg": String,
        "trackDescription": String,
        "directTipCount": Number,
        "directPlayCount": Number
    }

```

## Artist API

### Get Artist of Week

- GET - /artist/ofweek
- QUERY 
	clientId,clientSecret
- Response Object:
``` javascript
{
    "success": Boolean,
    "data": [
	{
	    "artistName": String,
            "artistAddress": String
	}
    ]
}
```


### getNewArtists()
- GET - /artist/new
- PARAMS 
	id - id of artist
- QUERY 
	clientId,clientSecret
	limit - Number limit of query instances (optional)

Response Object: 
``` javascript
{
    "success": Boolean,
    "data": [
		{
			"name": String,
            "joinDate": String,
            "profileLink": String
		}
		...
    ]
}
```

### getArtistInfo()

- GET - /artist/info/{id}
- PARAMS 
	id - id of artist
- QUERY 
	clientId,clientSecret

Response Object: 
``` javascript
{
    "totalTips": Number,
    "totalFollowers": Number,
    "totalReleases": Number,
    "totalPlays": Number
}
```
### getArtistPlays()

- GET - /artist/totalplays/{id}
- PARAMS 
	id - id of artist
- QUERY 
	clientId,clientSecret

Response Object: 
``` javascript
{
    "success": Boolean,
    "playsCount": Number
}
```
### getArtisttips()

- GET - /artist/totaltips/{id}
- PARAMS 
	id - id of artist
- QUERY 
	clientId,clientSecret

Response Object: 
``` javascript
{
    "success": Boolean,
    "tipsCount": Number
}
```
### isArtist()

Checks if current user is artist or not;

- GET - /artist/isartist
- QUERY 
	clientId,clientSecret

Response Object: 
``` javascript
{
	"success":Boolean
}
```

### isArtistVerified()
- GET - /artist/isverified
- QUERY 
	clientId,clientSecret

Response Object: 
``` javascript
{
	"success":Boolean
}
```
### getArtistEarnings()

- GET - /artist/earnings/{id}
- PARAMS
	id - artist _id
- QUERY 
	clientId,clientSecret

Response Object: 
``` javascript
{
    "success": Boolean,
    "tipCount": Number,
    "playCount": Number,
    "earned": Number
}
```
