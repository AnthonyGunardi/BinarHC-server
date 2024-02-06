const { User } = require('../models')

async function authorization (req, res, next) {
  const id = req.params.id
  const user = await User.findOne({
    where: { id }
  })
  if (user) {
    if (user.id === req.user.id) {
      next()
    } else {
      res.status(403).json({ message: "You are unauthorized to do this action!" })
    }
  } else {
    res.status(403).json({ message: "You are unauthorized to do this action!" })
  }
}

module.exports = authorization