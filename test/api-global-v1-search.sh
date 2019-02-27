#river5@gmail.com/123456
curl --location --request POST "https://t2.musicoin.org/api/v1/search?email=$1&accessToken=$2" \
  --header "Content-Type: application/json" \
  --data "{
    \"keyword\": \"dong\",
    \"limit\": \"2\",
    \"skip\": \"0\"
}"

