const config = require("../../config");

const { sign, verify } = require("jsonwebtoken");

const createToken = (payload) => {
  return sign(payload, config.jwt_secret, { expiresIn: config.jwt_expiration });
};

const checkToken = (token, callback) => {
  return verify(token, config.jwt_secret, callback);
};

module.exports = {
  createToken,
  checkToken,
};
