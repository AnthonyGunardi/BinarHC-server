function adminAuthorization (req, res, next) {
  const role = req.user.role
  if (role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: "You are unauthorized to do this action!" })
  }
}

module.exports = adminAuthorization