const { User, Point } = require('../models');
const AccessToken = require('../helpers/accessToken');

class UserController {
  static async register(req, res, next) {
    const userData = {
      firstname: req.body.firstname, 
      lastname: req.body.lastname, 
      nip: req.body.nip, 
      email: req.body.email, 
      password: req.body.password, 
      photo: req.body.photo, 
      is_admin: req.body.is_admin, 
      is_active: req.body.is_active
    };
    try {
      const user = await User.findOne({ where: { email: userData.email } });
      if (!Boolean(user)) {
        console.log(userData)
        const newUser = await User.create(userData);
        const { id, firstname, email } = newUser;
        const newPoint = await Point.create({ balance: 0, user_id: id});
        res.status(201).json({ id, firstname, email, balance: newPoint.balance, message: 'User is created' });
      } else {
        res.status(400).json({ message: 'User already exist' });
      }
    }
    catch (err) {
      next(err)
    };
  };

  static async login(req, res, next) {
    const userData = {
      email: req.body.email,
      password: req.body.password,
    };
    try {
      const user = await User.findOne({
        where: {
          email: userData.email,
          password: userData.password
        }
      });
      if (!user) {
        res.status(401).json({ message: 'Wrong Username or Password' });
      } else {
          const payload = {
            id: user.id,
            email: user.email,
            is_admin: user.is_admin
          };
          const accessToken = AccessToken.generate(payload);
          res.status(200).json({ id: user.id, email: user.email, accessToken });      
      }
    }
    catch (err) {
      next(err);
    }
  };

  // static async findAllUser(req, res, next) {
  //   const role = req.query.role || 'participant';
  //   try {
  //     const users = await User.findAll({
  //       where: { role }, 
  //       include: {
  //         model: Currency,
  //         attributes:['balance', 'updatedAt']
  //       }
  //     });
  //     if (!users || users.length == 0) {
  //       res.status(404).json({ message: 'User is not found'})
  //     } else {
  //         res.status(200).json(users);
  //     }
  //   }
  //   catch (err) {
  //     next(err);
  //   }
  // }

  // static async findUserById(req, res, next) {
  //   const id = req.params.id
  //   try {
  //     const user = await User.findOne({
  //       where: { id },
  //       include: [{
  //         model: Activity,
  //         attributes:['description', 'type', 'value']
  //       },
  //       {
  //         model: Currency,
  //         attributes:['balance', 'updatedAt']
  //       }]
  //     });
  //     if (!user) {
  //       res.status(404).json({ message: 'User is not found' })
  //     } else {
  //         res.status(200).json(user);
  //     }
  //   }
  //   catch (err) {
  //     next(err);
  //   }
  // }
};

module.exports = UserController;