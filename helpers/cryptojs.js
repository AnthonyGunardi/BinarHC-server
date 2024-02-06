const CryptoJS = require("crypto-js");
const SECRET_KEY = process.env.SECRET_KEY

class Crypto {
  static encrypt (password) {
    return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
  };

  static decrypt (password) {
    return CryptoJS.AES.decrypt(password, SECRET_KEY).toString(CryptoJS.enc.Utf8);
  };
};

module.exports = Crypto;