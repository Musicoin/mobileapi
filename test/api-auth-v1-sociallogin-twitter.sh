curl --location --request POST "https://t2.musicoin.org/api/v1/auth/sociallogin" \
  --header "Content-Type: application/json" \
  --data "{
    \"channel\": \"twitter\",
    \"oauthToken\": \"$1\",
    \"oauthTokenSecret\": \"$2\",
    \"oauthVerifier\": \"$3\"
}"

