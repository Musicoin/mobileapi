curl --location --request POST "https://t2.musicoin.org/api/v1/apple/iap" \
  --header "Content-Type: application/json" \
  --data "{
    \"email\": \"river@musicoin.org\",
    \"trackAddress\": \"0x70677065a0802d963a02d7f2149c0be36554ddb5\",
    \"musicoins\": 10
}"

