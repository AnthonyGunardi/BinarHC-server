const { User, Point, Biodata } = require('../models');
const { Op } = require('sequelize');
const AccessToken = require('../helpers/accessToken');
const { sendResponse, sendData } = require('../helpers/response.js');

class UserController {
  static async registerAdmin(req, res, next) {
    const userData = {
      firstname: req.body.firstname, 
      lastname: req.body.lastname,
      email: req.body.email, 
      password: req.body.password, 
      photo: req.body.photo, 
      is_admin: 'admin', 
      is_active: req.body.is_active
    };
    try {
      const user = await User.findOne({ where: { email: userData.email } });
      if (!Boolean(user)) {
        const newUser = await User.create(userData);
        const { firstname, lastname, email } = newUser;
        sendData(201, { firstname, lastname, email }, "User is created", res);   
      } else {
        sendResponse(400, 'User already exist', res)
      }
    }
    catch (err) {
      next(err)
    };
  };

  static async registerEmployee(req, res, next) {
    const userData = {
      firstname: req.body.firstname, 
      lastname: req.body.lastname, 
      nip: req.body.nip, 
      email: req.body.email, 
      password: req.body.password, 
      photo: req.body.photo, 
      is_admin: 'employee', 
      is_active: req.body.is_active
    };
    try {
      const user = await User.findOne({ 
        where:
          {
            [Op.or] : [
              { email: userData.email },
              { nip: userData.nip }
            ]
          }
      });
      if (Boolean(user)) {
        sendResponse(400, 'User already exist', res)
      } else {
        const newUser = await User.create(userData);
        const { id, firstname, lastname, email } = newUser;
        const { birthday, hometown, hire_date, religion, gender, last_education, job, marital_status, office_id, position_id, echelon_id } = req.body
        const newPoint = await Point.create({ balance: 0, user_id: id});
        const newBiodata = await Biodata.create(
          { birthday, hometown, hire_date, religion, gender, last_education, job, marital_status, office_id, position_id, echelon_id, 
            user_id: id
          }
        );
        sendData(201, { firstname, lastname, email, balance: newPoint.balance }, "User is created", res);  
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

  static async findAllAdmins(req, res, next) {
    try {
      const users = await User.findAll({
        where: { is_admin: 'admin' },
        attributes:['firstname', 'lastname', 'nip', 'email', 'photo', 'is_active', 'createdAt', 'updatedAt'],
        order: [['firstname', 'asc']]
      });
      sendData(200, users, "Success get all admins", res)
    }
    catch (err) {
      next(err);
    }
  };

  static async findAllEmployees(req, res, next) {
    try {
      const users = await User.findAll({
        where: { is_admin: 'employee' },
        attributes:['firstname', 'lastname', 'nip', 'email', 'photo', 'is_active', 'createdAt', 'updatedAt'],
        order: [['firstname', 'asc']],
        include: {
          model: Point,
          attributes:['balance']
        }
      });
      sendData(200, users, "Success get all employees", res)
    }
    catch (err) {
      next(err);
    }
  };

  static async getEmployee(req, res, next) {
    const nip = req.params.nip
    try {
      const user = await User.findOne({
          where: { nip, is_admin: 'employee' },
          attributes:['firstname', 'lastname', 'nip', 'email', 'photo', 'is_active'],
          include: [
            {
              model: Biodata,
              as: 'Biodata',
              attributes:['birthday', 'hometown', 'hire_date', 'religion', 'gender', 'last_education', 'job', 'marital_status' ]
            },
            {
              model: Point,
              attributes:['balance']
            }
        ]
      })
      if (!user) return sendResponse(404, "User not found", res)
      sendData(200, user, "Success Get Detail User", res)
    } 
    catch (error) {
      next(error)
    }
  }

  static async update(req, res, next) {
    const currentNip = req.params.nip
    const userData = {
      firstname: req.body.firstname, 
      lastname: req.body.lastname, 
      nip: req.body.nip, 
      email: req.body.email, 
      password: req.body.password, 
      photo: req.body.photo,
      is_active: req.body.is_active
    };
    const userBio = {
      birthday: req.body.birthday, 
      hometown: req.body.hometown, 
      hire_date: req.body.hire_date, 
      religion: req.body.religion, 
      gender: req.body.gender, 
      last_education: req.body.last_education,
      job: req.body.job,
      marital_status: req.body.marital_status,
      office_id: req.body.office_id,
      position_id: req.body.position_id,
      echelon_id: req.body.echelon_id
    };
    try {
      const user = await User.findOne({
        where: { nip: currentNip },
        include: 
          { model: Biodata,
          as: 'Biodata',
          attributes:['id', 'birthday', 'hometown', 'hire_date', 'religion', 'gender', 'last_education', 'job', 'marital_status' ]
        }
      })
      if (!user) return sendResponse(404, "User is not found", res)
      if (!user.Biodata || user.Biodata === null ) return sendResponse(404, "User biodata is not found", res)
      const userWithNewNip = await User.findOne({
        where: { 
          [Op.and]: [
            { 
              id: {
                [Op.ne]: user.id, 
              } 
            },
            { nip: userData.nip }
        ]
          }
      })
      if (userWithNewNip) return sendResponse(403, "NIP is already used", res)
      const updatedUser = await User.update(userData, {
        where: { id: user.id },
        returning: true
      })
      const updatedBiodata = await Biodata.update(userBio, {
        where: { id: user.Biodata.id },
        returning: true
      })
      sendResponse(200, "Success update user", res)
    }
    catch (err) {
      next(err)
    }
  };
};

module.exports = UserController;