const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');

/**
 * generate random token
 * @param {*} count token lenght
 */
function generateToken(count) {
  return crypto.randomBytes(count).toString('hex');
}

/**
 * hash the password before save to db
 * @param {*} password 
 */
function hashPassword(password) {
  return bcrypt.hashSync(password);
}

/**
 * 
 * @param {*} hash the hash password that save in db
 * @param {*} password user input password
 */
function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

module.exports = {
  generateToken,
  hashPassword,
  comparePassword
}

