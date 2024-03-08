const { User } = require('../models')

async function authorization (req, res, next) {
  const nip = req.params.nip
  const user = await User.findOne({
    where: { nip }
  })
  if (user) {
    if (user.nip === req.user.nip) {
      next()
    } else {
      res.status(403).json({ message: "You are unauthorized to do this action!" })
    }
  } else {
    res.status(403).json({ message: "You are unauthorized to do this action!" })
  }
}

module.exports = authorization