const { 
  User, Point, Biodata, Office, Position, Echelon, Point_Log, Reward_Log, Reward, Family, User_Address, Address, 
  Indonesia_Village, Indonesia_District, Indonesia_City, Indonesia_Province, User_Phone, Family_Phone, Phone
} = require('../models');
const Sequelize = require('sequelize');
let sequelize;
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}
const { Op } = require('sequelize');
const fs = require('fs')
const path = require('node:path');
const AccessToken = require('../helpers/accessToken');
const { sendResponse, sendData } = require('../helpers/response');
const { generateNIP } = require('../helpers/generateNip');
const { formatDate } = require('../helpers/formatDate');

class UserController {
  static async registerAdmin(req, res, next) {
    try {
      const { firstname, lastname, email, password, is_active } = req.body

      //check if user is already exist
      const user = await User.findOne({ where: { email } });
      if (Boolean(user)) return sendResponse(400, 'User already exist', res)

      //upload file if req.files isn't null
      let url = null;
      if (req.files !== null) {
        const file = req.files.photo;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        url = `admin-profiles/${fileName}`;

        //validate file type
        if(!allowedType.includes(ext.toLocaleLowerCase())) return sendResponse(422, "File must be image with extension png, jpg, jpeg", res)    
        //validate file size max 5mb
        if(fileSize > 5000000) return sendResponse(422, "Image must be less than 5 mb", res)
        //place the file on server
        file.mv(`./public/images/admin-profiles/${fileName}`, async (err) => {
          if(err) return sendResponse(502, err.message, res)
        })
      }

      const newUser = await User.create({ firstname, lastname, email, password, photo: url, is_admin: 'admin', is_active });
      sendData(201, { firstname: newUser.firstname, lastname: newUser.lastname, email: newUser.email }, "User is created", res);
    }
    catch (err) {
      next(err)
    };
  };

  static async registerEmployee(req, res, next) {    
    try {
      const { 
        firstname, lastname, email, is_active, 
        office_slug, position_slug, echelon_code, 
        birthday, hometown, hire_date, religion, gender, last_education, job, marital_status 
      } = req.body;
      const password = formatDate(birthday);

      //check if the office_slug, position_slug & echelon_code are valid
      const office = await Office.findOne({
        where: {slug: office_slug}
      });
      if (!office) return sendResponse(404, "Office not found", res)
      const position = await Position.findOne({
        where: {slug: position_slug}
      });
      if (!position) return sendResponse(404, "Position not found", res)
      const echelon = await Echelon.findOne({
        where: {code: echelon_code}
      });
      if (!echelon) return sendResponse(404, "Echelon not found", res)

      //generate NIP
      const users = await User.findAll({
        where: { is_admin: 'employee' }
      });
      const userCount = users.length + 1;
      const nip = generateNIP('BINAR', userCount);

      //check if user already exist
      const user = await User.findOne({ 
        where:
          {
            [Op.or] : [
              { email },
              { nip }
            ]
          }
      });
      if (Boolean(user)) return sendResponse(400, 'User already exist', res)

      //upload file if req.files isn't null
      let url = null;
      if (req.files !== null) {
        const file = req.files.photo;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        url = `user-profiles/${fileName}`;

        //validate file type
        if(!allowedType.includes(ext.toLocaleLowerCase())) return sendResponse(422, "File must be image with extension png, jpg, jpeg", res)    
        //validate file size max 5mb
        if(fileSize > 5000000) return sendResponse(422, "Image must be less than 5 mb", res)
        //place the file on server
        file.mv(`./public/images/user-profiles/${fileName}`, async (err) => {
          if(err) return sendResponse(502, err.message, res)
        })
      }

      const newUser = await User.create({ firstname, lastname, nip, email, password, photo: url, is_admin: 'employee', is_active });
      const newPoint = await Point.create({ balance: 0, user_id: newUser.id});
      const newBiodata = await Biodata.create(
        { 
          birthday, hometown, hire_date, religion, gender, last_education, job, marital_status, 
          office_id: office.id, position_id: position.id, echelon_id: echelon.id, user_id: newUser.id
        }
      );
      sendData(201, { firstname: newUser.firstname, lastname: newUser.lastname, email: newUser.email, balance: newPoint.balance }, "User is created", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async adminLogin(req, res, next) {
    const userData = {
      email: req.body.email,
      password: req.body.password,
    };
    try {
      //check if admin or super admin user is exist
      const user = await User.findOne({
        where: {
          email: userData.email,
          password: userData.password,
          is_admin: {
            [Op.or]: ['admin', 'superadmin']
          },
          is_active: true
        }
      });
      if (!user) return sendResponse(401, "Wrong Email or Password", res)

      //generate Access Token
      const payload = {
        firstname: user.firstname,
        lastname: user.lastname,
        nip: user.nip,
        email: user.email,
        photo: user.photo,
        is_admin: user.is_admin
      };
      const accessToken = AccessToken.generate(payload);
      const data = { accessToken }
      sendData(200, data, "Login successful", res)      
    }
    catch (err) {
      next(err);
    }
  };

  static async employeeLogin(req, res, next) {
    const userData = {
      nip: req.body.nip,
      password: req.body.password,
    };
    try {
      //check if user is exist
      const user = await User.findOne({
        where: {
          nip: userData.nip,
          password: userData.password,
          is_admin: 'employee',
          is_active: true
        }
      });
      if (!user) return sendResponse(401, "Wrong NIP or Password", res)

      //generate Access Token
      const payload = {
        firstname: user.firstname,
        lastname: user.lastname,
        nip: user.nip,
        email: user.email,
        photo: user.photo,
        is_admin: user.is_admin
      };
      const accessToken = AccessToken.generate(payload);
      const data = { accessToken }
      sendData(200, data, "Login successful", res)      
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

  static async findBirthdayEmployees(req, res, next) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);
    try {
      const users = await User.findAll({
        where: { is_admin: 'employee', is_active: true },
        attributes:['firstname', 'lastname', 'nip', 'photo', 'is_active'],
        include: {
          model: Biodata,
          as: 'Biodata',
          where: {
            [Op.or]: [
              {
                [Op.and]: [
                  sequelize.literal(`MONTH(birthday) = ${today.getMonth() + 1}`),
                  sequelize.literal(`DAY(birthday) >= ${today.getDate()}`),
                ]
              },
              {
                [Op.and]: [
                  sequelize.literal(`MONTH(birthday) = ${futureDate.getMonth() + 1}`),
                  Sequelize.literal(`DAY(birthday) <= ${futureDate.getDate()}`),
                ]
              }
            ]
          },
          attributes:['birthday'],
          include: {
            model: Office,
            attributes: {
              exclude: ['id', 'createdAt', 'updatedAt']
            }
          }
        },
        order: [['Biodata', 'birthday', 'desc']]
      });
      sendData(200, users, "Success get all birthday employees", res)
      // res.json({today, futureDate})
    }
    catch (err) {
      console.log(err.message)
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
              attributes:['birthday', 'hometown', 'hire_date', 'religion', 'gender', 'last_education', 'job', 'marital_status' ],
              include: [
                {
                  model: Office,
                  attributes: {
                    exclude: ['id']
                  }
                },
                {
                  model: Position,
                  attributes: {
                    exclude: ['id']
                  }
                },
                {
                  model: Echelon,
                  attributes: {
                    exclude: ['id']
                  }
                }
              ]
            },
            {
              model: Point,
              attributes: ['balance']
            },
            {
              model: Point_Log,
              as: 'Obtained_Point_Log',
              attributes: {
                exclude: ['user_id', 'admin_id']
              },
              include: {
                model: User,
                as: 'Approved_Point_Log',
                attributes: ['firstname', 'lastname']
              }
            },
            {
              model: Reward_Log,
              as: 'Obtained_Reward_Log',
              attributes: {
                exclude: ['user_id', 'admin_id']
              },
              include: [
                {
                  model: Reward,
                  attributes: ['title', 'description', 'point']
                },
                {
                  model: User,
                  as: 'Approved_Reward_Log',
                  attributes: ['firstname', 'lastname']
                }
              ]
            },
            {
              model: Family,
              attributes: {
                exclude: ['user_id']
              },
              include: {
                model: Family_Phone,
                attributes: {
                  exclude: ['family_id']
                },
                include: {
                  model: Phone,
                  attributes: {
                    exclude: ['id']
                  }
                }
              }
            },
            {
              model: User_Address,
              attributes: {
                exclude: ['user_id']
              },
              include: {
                model: Address,
                attributes: {
                  exclude: ['village_id']
                },
                include: {
                  model: Indonesia_Village,
                  attributes: {
                    exclude: ['id', 'district_id', 'created_at', 'updated_at']
                  },
                  include: {
                    model: Indonesia_District,
                    attributes: {
                      exclude: ['id', 'city_id', 'created_at', 'updated_at']
                    },
                    include: {
                      model: Indonesia_City,
                      attributes: {
                        exclude: ['id', 'province_id', 'created_at', 'updated_at']
                      },
                      include: {
                        model: Indonesia_Province,
                        attributes: {
                          exclude: ['id', 'created_at', 'updated_at']
                        }
                      }
                    }
                  }
                }
              }
            },
            {
              model: User_Phone,
              attributes: {
                exclude: ['user_id']
              },
              include: {
                model: Phone,
                attributes: {
                  exclude: ['id']
                }
              }
            }
          ],
          order: [
            [ 'Obtained_Point_Log', 'updatedAt', 'desc' ],
            [ 'Obtained_Reward_Log', 'updatedAt', 'desc' ]
          ]
      })
      if (!user) return sendResponse(404, "User not found", res)
      sendData(200, user, "Success Get Detail User", res)
    } 
    catch (error) {
      next(error)
    }
  }

  static async toggleUser(req, res, next) {
    const currentNip = req.params.nip
    let userData = {
      is_active: false
    };
    try {
      const user = await User.findOne({
        where: { nip: currentNip }
      })
      if (!user) return sendResponse(404, "User is not found", res)
      if (user.is_active == false) {
        userData.is_active = true
      }
      const updated = await User.update(userData, {
        where: { id: user.id },
        returning: true
      })
      sendResponse(200, "Success update user", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async resetEmployeePassword(req, res, next) {
    const email = req.params.email;
    try {
      const user = await User.findOne({
        where: { email, is_admin: 'employee' },
        include: { 
          model: Biodata,
          as: 'Biodata'
        }
      })
      if (!user) return sendResponse(404, "User is not found", res)
      if (!user.Biodata || user.Biodata === null ) return sendResponse(404, "User biodata is not found", res)

      //set default password with user's birthday date in DDMMYYYY format
      const password = formatDate(user.Biodata.birthday);
      const updated = await User.update({ password }, {
        where: { id: user.id },
        returning: true
      })
      sendResponse(200, "Success update password", res)

    }
    catch (err) {
      next(err)
    }
  }

  static async updateEmployee(req, res, next) {
    const currentNip = req.params.nip
    const { 
      firstname, lastname, email, password, is_active, 
      office_slug, position_slug, echelon_code, 
      birthday, hometown, hire_date, religion, gender, last_education, job, marital_status 
    } = req.body;
    try {
      //check if user is exist
      const user = await User.findOne({
        where: { nip: currentNip },
        include: { 
          model: Biodata,
          as: 'Biodata'
        }
      })
      if (!user) return sendResponse(404, "User is not found", res)
      if (!user.Biodata || user.Biodata === null ) return sendResponse(404, "User biodata is not found", res)

      //check if the office_slug, position_slug & echelon_code are valid
      const office = await Office.findOne({
        where: {slug: office_slug}
      });
      if (!office) return sendResponse(404, "Office not found", res)
      const position = await Position.findOne({
        where: {slug: position_slug}
      });
      if (!position) return sendResponse(404, "Position not found", res)
      const echelon = await Echelon.findOne({
        where: {code: echelon_code}
      });
      if (!echelon) return sendResponse(404, "Echelon not found", res)

      //check if new NIP or new email is already used
      const userWithNewNip = await User.findOne({
        where: { 
          [Op.and]: [
            { 
              id: {
                [Op.ne]: user.id, 
              } 
            },
            { email }
          ]
        }
      })
      if (userWithNewNip) return sendResponse(403, "NIP or email is already used", res)

      //upload file if req.files isn't null
      let url;
      if(!req.files) {
        url = user.photo;
      } else {
        const file = req.files.photo;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        url = `user-profiles/${fileName}`;
    
        //validate file type
        if(!allowedType.includes(ext.toLocaleLowerCase())) return sendResponse(422, "File must be image with extension png, jpg, jpeg", res)
        //validate file size max 5mb
        if(fileSize > 5000000) return sendResponse(422, "Image must be less than 5 mb", res)
        //place the file on server
        file.mv(`./public/images/user-profiles/${fileName}`, async (err) => {
          if(err) return sendResponse(502, err.message, res)
        })
        //delete previous file on server
        if (user.photo !== null) {
          const filePath = `./public/images/${user.photo}`;
          fs.unlinkSync(filePath);
        }
      }

      const updatedUser = await User.update(
        { 
          firstname, lastname, password, email, photo: url, is_active 
        }, 
        {
        where: { id: user.id },
        returning: true
        }
      )
      const updatedBiodata = await Biodata.update(
        { 
          birthday, hometown, hire_date, religion, gender, last_education, job, marital_status, 
          office_id: office.id, position_id: position.id, echelon_id: echelon.id, user_id: user.id
        }, 
        {
        where: { id: user.Biodata.id },
        returning: true
        }
      )
      sendResponse(200, "Success update user", res)
    }
    catch (err) {
      next(err)
    }
  };
};

module.exports = UserController;