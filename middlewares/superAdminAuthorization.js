function superAdminAuthorization (req, res, next) {
  const role = req.user.is_admin
  if (role === 'superadmin') {
    next()
  } else {
    res.status(403).json({ message: "You are unauthorized to do this action!" })
  }
}

module.exports = superAdminAuthorization