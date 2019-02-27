curl --location --request POST "https://t2.musicoin.org/api/v1/auth/sociallogin" \
  --header "Content-Type: application/json" \
  --data "{
    \"channel\": \"google\",
    \"accessToken\": \"$1\"
}"

