const {
  User, Biodata, Office, Position, Echelon, Attendance, Absence, Overtime, Point, Point_Log, Reward_Log, Reward, 
  Family, User_Address, Family_Address, Office_Address, Address, Indonesia_Village, Indonesia_District, Indonesia_City, Indonesia_Province,
  User_Phone, Family_Phone, Office_Phone, Phone, Master_Data, Employment_Status, Employment_Periode
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
      const { fullname, email, password, is_active } = req.body

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

      const newUser = await User.create({ fullname, email, password, photo: url, is_admin: 'admin', is_active });
      sendData(201, { fullname: newUser.fullname, email: newUser.email }, "User is created", res);
    }
    catch (err) {
      next(err)
    };
  };

  static async registerEmployee(req, res, next) {    
    try {
      const { 
        fullname, nip, id_card, email, is_permanent, status_employee, expired, is_active, 
        office_slug, echelon_code, 
        birthday, hometown, hire_date, religion, gender, last_education, marital_status 
      } = req.body;
      const password = formatDate(birthday);
      let employment_status;

      //check if the office_slug & echelon_code are valid
      const office = await Office.findOne({
        where: {slug: office_slug}
      });
      if (!office) return sendResponse(404, "Office not found", res)

      const echelon = await Echelon.findOne({
        where: {code: echelon_code}
      });
      if (!echelon) return sendResponse(404, "Echelon not found", res)

      //generate NIP
      // const users = await User.findAll({
      //   where: { is_admin: 'employee' }
      // });
      // const userCount = users.length + 1;
      // const nip = generateNIP('BINAR', userCount);

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
      if (Boolean(user)) return sendResponse(400, 'Email or NIP already exist', res)

      //checking before creating any input data into db
      if (is_permanent === false || is_permanent === "false") {
        //check if expired is provided
        if (!expired) return sendResponse(400, 'Expired is required', res)

        //check if employment status is exist
        employment_status = await Employment_Status.findOne({ where: { id: status_employee } });
        if (!employment_status) return sendResponse(404, `Employment status is not found`, res)
      }

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

      const newUser = await User.create({ fullname, nip, id_card, email, password, photo: url, is_permanent,is_admin: 'employee', is_active });
      const newPoint = await Point.create({ balance: 0, user_id: newUser.id});
      const newBiodata = await Biodata.create(
        { 
          birthday, hometown, hire_date, religion, gender, last_education, marital_status, 
          office_id: office.id, echelon_id: echelon.id, user_id: newUser.id
        }
      );
      if (is_permanent === false || is_permanent === "false") {
        const newEmploymentPeriode = await Employment_Periode.create(
          { user_id: newUser.id, status_id: status_employee, period: expired }
        )
      }
      sendData(201, { fullname: newUser.fullname, nip: newUser.nip, email: newUser.email, balance: newPoint.balance }, "User is created", res);  
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
        fullname: user.fullname,
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
        fullname: user.fullname,
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
        attributes:['fullname', 'nip', 'email', 'photo', 'is_active', 'createdAt', 'updatedAt'],
        order: [['fullname', 'asc']]
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
        attributes:['fullname', 'nip', 'email', 'id_card', 'photo', 'is_permanent', 'is_active', 'createdAt', 'updatedAt'],
        order: [['fullname', 'asc']],
        include: [
          {
          model: Point,
          attributes:['balance']
          },
          {
            model: Biodata,
            as: 'Biodata',
            attributes:['id'],
            include: {
              model: Office,
              attributes: ['name'],
            }
          }
        ]
      });
      const results = users.map(user => {
        let officeName;
        if (user.Biodata && user.Biodata.Office) {
          officeName = user.Biodata.Office.name;
        }
        return {
          ...user.toJSON(),
          office: officeName,
          Biodata: undefined // Remove Biodata
        }
      });
      sendData(200, results, "Success get all employees", res)
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
        attributes:['fullname', 'nip', 'photo', 'is_active'],
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
    }
    catch (err) {
      console.log(err.message)
      next(err);
    }
  };

  static async getEmployee(req, res, next) {
    const nip = req.params.nip;
    const today = new Date().toISOString().slice(0, 10);
    const parsedToday = new Date(today);
    let isWFA;
    try {
      const user = await User.findOne({
        where: { nip, is_admin: 'employee' },
        attributes:['id', 'fullname', 'nip', 'email', 'id_card', 'photo', 'is_permanent', 'is_active'],
        include: [
          {
            model: Biodata,
            as: 'Biodata',
            attributes:['birthday', 'hometown', 'hire_date', 'religion', 'gender', 'last_education', 'marital_status' ],
            include: [
              {
                model: Office,
                attributes: {
                  exclude: ['id']
                },
                include: [
                  {
                    model: Office_Address,
                    attributes: {
                      exclude: ['office_id','createdAt', 'updatedAt']
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
                    model: Office_Phone,
                    attributes: {
                      exclude: ['office_id']
                    },
                    include: {
                      model: Phone,
                      attributes: {
                        exclude: ['id']
                      }
                    }
                  }
                ]
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
            model: Employment_Periode,
            attributes: ['id', 'status_id', 'period'],
            include: {
              model: Employment_Status,
              attributes: ['id', 'name']
            }
          },
          {
            model: Position,
            through: {
              attributes: []
            },
            attributes: {
              exclude: ['id']
            }
          },
          {
            model: Attendance,
            required: false, // LEFT JOIN
            where: {
              date: today
            },
            attributes: {
              exclude: ['user_id']
            }
          },
          {
            model: Absence,
            as: 'Absence_Request',
            required: false, // LEFT JOIN
            where: {
              start_date: {
                [Op.between]: [
                  new Date(new Date().getFullYear(), 0, 1), // January 1st of the current year
                  new Date(new Date().getFullYear(), 11, 31) // December 31st of the current year
                ]
              },
              type: 'Cuti',
              status: 'success'
            },
            attributes: {
              exclude: ['user_id']
            }
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
              attributes: ['fullname']
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
                attributes: ['fullname']
              }
            ]
          },
          {
            model: Family,
            attributes: {
              exclude: ['user_id']
            },
            include: [
              {
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
              },
              {
                model: Family_Address,
                attributes: {
                  exclude: ['family_id','createdAt', 'updatedAt']
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
              }
            ]
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

      // get WFA permission status
      const overtime = await Overtime.findOne({ 
        where: {
          start_time: {
            [Op.lte]: parsedToday, // start_date should be less than or equal to today
          },
          end_time: {
            [Op.gte]: parsedToday, // end_date should be greater than or equal to today
          },
          type: 'WFA',
          employee_id: user.id, 
          status: 'success' 
        } 
      });
      if (!overtime) {
        isWFA = false
      } else {
        isWFA = true
      };

      // Get annual leave
      const master_data = await Master_Data.findOne( { where: {id: 1} });

      // Calculate remaining annual leave
      let totalAbsenceDays = 0;
      user.Absence_Request.forEach(absence => {
        const startDate = new Date(absence.start_date);
        const endDate = new Date(absence.end_date);
        const duration = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1; // Include the start day
        totalAbsenceDays += duration;
      });
      const remainingAnnualLeave = master_data.annual_leave - totalAbsenceDays;

      // convert user, from sequelize instance to plain JavaScript object, and then destructure it
      const data = {...user.get({ plain: true }), isWFA, remainingAnnualLeave};

      sendData(200, data, "Success Get Detail User", res)
    } 
    catch (error) {
      next(error.message)
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

  static async resetPassword(req, res, next) {
    const email = req.params.email;
    try {
      const user = await User.findOne({
        where: { email },
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

  static async updatePassword(req, res, next) {
    const nip = req.params.nip;
    const { old_password, new_password } = req.body;
    try {
      const user = await User.findOne({
        where: { nip, password: old_password }
      })
      if (!user) return sendResponse(404, "Old Password does not match", res)

      const updated = await User.update({ password: new_password }, {
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
      fullname, nip, id_card, email, is_permanent, status_employee, expired, is_active, 
      office_slug, echelon_code, 
      birthday, hometown, hire_date, religion, gender, last_education, marital_status 
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

      const echelon = await Echelon.findOne({
        where: {code: echelon_code}
      });
      if (!echelon) return sendResponse(404, "Echelon not found", res)

      //check if new email or NIP is already used
      const userWithNewNip = await User.findOne({
        where: { 
          [Op.and]: [
            { 
              id: {
                [Op.ne]: user.id, 
              } 
            },
            { [Op.or]: [
                { email },
                { nip } 
              ]
            } 
          ]
        }
      })
      if (userWithNewNip) return sendResponse(403, "Email or NIP is already used", res)

      //checking before creating any input data into db
      if (is_permanent === false || is_permanent === "false") {
        //check if expired is provided
        if (!expired) return sendResponse(400, 'Expired is required', res)

        //check if employment status is exist
        employment_status = await Employment_Status.findOne({ where: { id: status_employee } });
        if (!employment_status) return sendResponse(404, `Employment status is not found`, res)
      }

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

      if (is_permanent === false || is_permanent === "false") {
        const updated_period = await Employment_Periode.update(
          { 
            status_id: status_employee, period: expired
          }, 
          {
          where: { user_id: user.id },
          returning: true
          }
        )
      }

      const updatedUser = await User.update(
        { 
          fullname, nip, id_card, email, photo: url, is_permanent, is_active 
        }, 
        {
        where: { id: user.id },
        returning: true
        }
      )
      const updatedBiodata = await Biodata.update(
        { 
          birthday, hometown, hire_date, religion, gender, last_education, marital_status, 
          office_id: office.id, echelon_id: echelon.id, user_id: user.id
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