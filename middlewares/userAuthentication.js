const AccessToken = require("../helpers/accessToken")

function authentication(req, res, next) {
  const authorizationHeader = req.headers.authorization
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header is not valid!" });
  }
  const token = authorizationHeader.replace("Bearer ", "")
  if (token) {
    AccessToken.verify(token, (err, user) => {
      if (err) {
        return res.status(401).json({ message: "Token is not valid!" })
      } else {
        req.user = user
        next()
      }
    })
  } else {
    return res.status(401).json({ message: "Please login first!" })
  }
}

module.exports = authentication