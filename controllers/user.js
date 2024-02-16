const { User, Point } = require('../models');
const AccessToken = require('../helpers/accessToken');
const { sendResponse, sendData } = require('../helpers/response.js');

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
        const newUser = await User.create(userData);
        const { id, firstname, email } = newUser;
        const newPoint = await Point.create({ balance: 0, user_id: id});
        sendData(201, { id, firstname, email, balance: newPoint.balance }, "User is created", res);   
      } else {
        sendResponse(400, 'User already exist', res)
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
          password: userData.password,
          is_admin: false,
          is_active: true
        }
      });
      if (!user) {
        res.status(401).json({ message: 'Wrong Username or Password' });
      } else {
          const payload = {
            firstname: user.firstname,
            lastname: user.lastname,
            nip: user.nip,
            email: user.email,
            photo: user.photo,
            is_admin: user.is_admin
          };
          const accessToken = AccessToken.generate(payload);
          const data = {
            accessToken
          }
          sendData(200, data, "Login successful", res)      
      }
    }
    catch (err) {
      next(err);
    }
  };

  static async adminLogin(req, res, next) {
    const userData = {
      email: req.body.email,
      password: req.body.password
    };
    try {
      const user = await User.findOne({
        where: {
          email: userData.email,
          password: userData.password,
          is_admin: true,
          is_active: true
        }
      });
      if (!user) {
        res.status(401).json({ message: 'Wrong Username or Password' });
      } else {
          const payload = {
            firstname: user.firstname,
            lastname: user.lastname,
            nip: user.nip,
            email: user.email,
            photo: user.photo,
            is_admin: user.is_admin
          };
          const accessToken = AccessToken.generate(payload);
          const data = {
            accessToken
          }
          sendData(200, data, "Login successful", res)         
      }
    }
    catch (err) {
      next(err);
    }
  };

  static async findAllUser(req, res, next) {
    try {
      const users = await User.findAll({
        where: { is_admin: false }, 
        include: {
          model: Point,
          attributes:['balance']
        }
      });
      sendData(200, users, "Success get all users", res)
    }
    catch (err) {
      next(err);
    }
  };
};

module.exports = UserController;