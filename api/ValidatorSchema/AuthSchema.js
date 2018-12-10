const SignUp = {
  username: {
    type: "string",
    min: 3
  },
  password: {
    type: "string",
    min: 6
  },
  email: {
    type: 'email'
  }
};

const Login = {
  password: {
    type: "string",
    min: 6
  },
  email: {
    type: 'email'
  }
};

const SignIn = {
  email: {
    type: "string",
    min: 3
  },
  clientSecret: {
    type: "string",
    length: 60
  }
};

const AccessToken = {
  email: {
    type: "string",
    min: 3
  },
  accessToken: {
    type: "string",
    length: 80
  }
}

module.exports = {
  signup: SignUp,
  signin: SignIn,
  login: Login,
  AccessToken
};
