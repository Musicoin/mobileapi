curl --location --request POST "https://t2.musicoin.org/api/v1/apple/iap?email=$1&accessToken=$2" \
  --header "Content-Type: application/json" \
  --data "{
    \"receipt\": \"\"
}"

