const jwt = require("jsonwebtoken");
const SECRET_KEY= process.env.SECRET_KEY

class AccessToken {
  static generate (payload) {
    return jwt.sign(payload, SECRET_KEY, {expiresIn: '3d'})
  };

  static verify (token, callback) {
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        callback(err, null)
      } else {
        callback(null, user)
      }
    });
  };
};

module.exports = AccessToken;