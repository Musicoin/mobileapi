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
  clientId: {
    type: "string",
    min: 10
  },
  clientSecret: {
    type: "string",
    length: 30
  }
};

module.exports = {
  signup: SignUp,
  signin: SignIn,
  login: Login
};
