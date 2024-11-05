const { Overtime, User, Biodata, Office, Echelon } = require('../models/index.js');
const { Op } = require('sequelize');
const fs = require('fs')
const path = require('node:path');
const { sendResponse, sendData } = require('../helpers/response.js');

class OvertimeController {
  static async createByEmployee(req, res, next) {
    try {
      const userEmail = req.user.email
      const { start_time, end_time, type, meta, note } = req.body;

      //check if user is exist and is login
      const user = await User.findOne({ 
        where: { email: userEmail } 
      });
      if (!user) return sendResponse(404, "User is not found", res);

      //check if overtime request already exist
      const overtime = await Overtime.findOne({ 
        where: { start_time, end_time, employee_id: user.id } 
      });
      if (Boolean(overtime)) return sendResponse(400, 'Overtime request already exist', res);

      //upload file if req.files isn't null
      let url = null
      if (req.files != null) {
        const file = req.files.photo;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        url = `overtime-requests/${fileName}`;

        //validate file type
        if(!allowedType.includes(ext.toLocaleLowerCase())) return sendResponse(422, "File must be image with extension png, jpg, jpeg", res)    
        //validate file size max 5mb
        if(fileSize > 5000000) return sendResponse(422, "Image must be less than 5 mb", res)
        //place the file on server
        file.mv(`./public/images/overtime-requests/${fileName}`, async (err) => {
          if(err) return sendResponse(502, err.message, res)
        })
      }

      const newOvertime = await Overtime.create(
        { start_time, end_time, type, photo: url, meta, note, employee_id: user.id }
      );
      sendData(201, { id: newOvertime.id, start_time: newOvertime.start_time, end_time: newOvertime.end_time, employee_id: newOvertime.employee_id }, "Berhasil diajukan", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async createByAdmin(req, res, next) {
    try {
      const userEmail = req.user.email
      const { start_time, end_time, type, nip, meta, note } = req.body;

      //get admin_id
      const admin = await User.findOne({ 
        where: { email: userEmail } 
      });
      if (!admin) return sendResponse(404, "User is not found", res);

      //check if user is exist
      const user = await User.findOne({ 
        where: { nip } 
      });
      if (!user) return sendResponse(404, "Employee is not found", res);

      //check if overtime request already exist
      const overtime = await Overtime.findOne({ 
        where: { start_time, end_time, employee_id: user.id } 
      });
      if (Boolean(overtime)) return sendResponse(400, 'Overtime request already exist', res);

      //upload file if req.files isn't null
      let url = null
      if (req.files != null) {
        const file = req.files.photo;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        url = `overtime-requests/${fileName}`;

        //validate file type
        if(!allowedType.includes(ext.toLocaleLowerCase())) return sendResponse(422, "File must be image with extension png, jpg, jpeg", res)    
        //validate file size max 5mb
        if(fileSize > 5000000) return sendResponse(422, "Image must be less than 5 mb", res)
        //place the file on server
        file.mv(`./public/images/overtime-requests/${fileName}`, async (err) => {
          if(err) return sendResponse(502, err.message, res)
        })
      }

      const newOvertime = await Overtime.create(
        { start_time, end_time, type, status: 'success', photo: url, meta, note, employee_id: user.id, admin_id: admin.id }
      );
      sendData(201, { id: newOvertime.id, start_time: newOvertime.start_time, end_time: newOvertime.end_time, employee_id: newOvertime.employee_id }, "Pengajuan Overtime berhasil", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getAllOvertimes(req, res, next) {
    try {
      const { division_slug, start_date, end_date, status } = req.query;
      const overtimeFilters = {};
    
      // Apply date range filter only if both start_date and end_date are provided
      if (start_date && end_date) {
        overtimeFilters.start_time = {
          [Op.gte]: start_date,
          [Op.lte]: end_date
        };
      }
      // Apply status filter only if status is provided
      if (status) {
        overtimeFilters.status = status;
      }
      
      const overtimes = await Overtime.findAll({
        where: overtimeFilters,
        attributes: {
          exclude: ['employee_id', 'admin_id']
        },
        include: [
          {
            model: User,
            as: 'Overtime_Requester',
            attributes: {
              exclude: ['id', 'email', 'password', 'id_card', 'createdAt', 'updatedAt']
            },
            required: true,
            include: [
              {
                model: Biodata,
                as: 'Biodata',
                required: true,
                attributes: {
                  exclude: [
                    'id', 
                    'birthday', 
                    'hometown', 
                    'hire_date', 
                    'religion', 
                    'gender', 
                    'last_education', 
                    'marital_status',
                    'user_id',
                    'createdAt', 
                    'updatedAt'
                  ]
                },
                include: [
                  {
                    model: Echelon,
                    required: false,
                    attributes: ['title']
                  },
                  {
                    model: Office,
                    as: 'Office',
                    where: division_slug ? { slug: division_slug } : {}, // Apply filter only if division_slug is provided
                    required: !!division_slug, // If division_slug is provided, make it required
                    attributes: ['name']
                  }
                ]
              }
            ]
          },
          {
            model: User,
            as: 'Overtime_Approver',
            attributes: {
              exclude: ['id', 'email', 'password', 'id_card', 'createdAt', 'updatedAt']
            }
          },
        ],
        order: [['id', 'ASC']]
      });
      sendData(200, overtimes, "Success get all overtimes", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getOvertimesByScroll(req, res, next) {
    try {
      const lastID = parseInt(req.query.lastID) || 0;
      const limit = parseInt(req.query.limit) || 0;
      const type = req.query.type || "";
      let result = [];

      if (lastID < 1) {
        //get overtimes where its status is like keyword
        const results = await Overtime.findAll({
          where: {
            type: {
              [Op.like]: '%'+type+'%'
            }
          },
          attributes: {
            exclude: ['employee_id', 'admin_id']
          },
          include: [
            {
              model: User,
              as: 'Overtime_Requester',
              attributes: {
                exclude: ['createdAt', 'updatedAt']
              }
            },
            {
              model: User,
              as: 'Overtime_Approver',
              attributes: {
                exclude: ['createdAt', 'updatedAt']
              }
            },
          ],
          limit: limit,
          order: [
            ['id', 'DESC']
          ]
        })
        result = results
      } else {
        //get overtimes where its status is like keyword
        const results = await Overtime.findAll({
          where: {
            id: {
              [Op.lt]: lastID
            },
            type: {
              [Op.like]: '%'+type+'%'
            },
          },
          attributes: {
            exclude: ['employee_id']
          },
          include: {
            model: User,
            as: 'Overtime_Requester',
            attributes: {
              exclude: ['createdAt', 'updatedAt']
            }
          },
          limit: limit,
          order: [
            ['id', 'DESC']
          ]
        })
        result = results
      }
      
      const payload = {
        datas: result,
        lastID: result.length ? result[result.length - 1].id : 0,
        hasMore: result.length >= limit ? true : false
      };
      sendData(200, payload, "Success get overtimes data", res)
    } 
    catch (err) {
        next(err)
    };
  };

  static async getUserOvertimesByScroll(req, res, next) {
    try {
      const lastID = parseInt(req.query.lastID) || 0;
      const limit = parseInt(req.query.limit) || 0;
      const type = req.query.type || "";
      const userEmail = req.user.email;
      let result = [];

      //get user_id
      const user = await User.findOne({ 
        where: { email: userEmail } 
      });
      if (!user) return sendResponse(404, "User is not found", res);

      if (lastID < 1) {
        //get overtimes where its type is like keyword
        const results = await Overtime.findAll({
          where: {
            type: {
              [Op.like]: '%'+type+'%'
            },
            employee_id: user.id
          },
          attributes: {
            exclude: ['employee_id']
          },
          include: {
            model: User,
            as: 'Overtime_Requester',
            attributes: {
              exclude: ['createdAt', 'updatedAt']
            }
          },
          limit: limit,
          order: [
            ['id', 'DESC']
          ]
        })
        result = results
      } else {
        //get overtimes where its type is like keyword
        const results = await Overtime.findAll({
          where: {
            id: {
              [Op.lt]: lastID
            },
            type: {
              [Op.like]: '%'+type+'%'
            },
          },
          attributes: {
            exclude: ['employee_id']
          },
          include: {
            model: User,
            as: 'Overtime_Requester',
            attributes: {
              exclude: ['createdAt', 'updatedAt']
            }
          },
          limit: limit,
          order: [
            ['id', 'DESC']
          ]
        })
        result = results
      }
      
      const payload = {
        datas: result,
        lastID: result.length ? result[result.length - 1].id : 0,
        hasMore: result.length >= limit ? true : false
      };
      sendData(200, payload, "Success get overtimes data", res)
    } 
    catch (err) {
        next(err)
    };
  };

  static async update(req, res, next) {
    const id = req.params.id
    const userEmail = req.user.email
    const { start_time, end_time, type, status, meta, note } = req.body;
    try {
      //get user_id
      const user = await User.findOne({ 
        where: { email: userEmail } 
      });
      if (!user) return sendResponse(404, "User is not found", res);

      //check if overtime is exist
      const overtime = await Overtime.findOne({
        where: { id }
      })
      if (!overtime) return sendResponse(404, "Overtime is not found", res)

      //upload file if req.files isn't null
      let url;
      if(!req.files) {
        url = overtime.photo;
      } else {
        const file = req.files.photo;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        url = `overtime-requests/${fileName}`;
    
        //validate file type
        if(!allowedType.includes(ext.toLocaleLowerCase())) return sendResponse(422, "File must be image with extension png, jpg, jpeg", res)
        //validate file size max 5mb
        if(fileSize > 5000000) return sendResponse(422, "Image must be less than 5 mb", res)
        //place the file on server
        file.mv(`./public/images/overtime-requests/${fileName}`, async (err) => {
          if(err) return sendResponse(502, err.message, res)
        })
        //delete previous file on server
        if (overtime.photo !== null) {
          const filePath = `./public/images/${overtime.photo}`;
          fs.unlinkSync(filePath);
        }
      }

      const updatedOvertime = await Overtime.update(
        { start_time, end_time, type, status, photo: url, meta, note, admin_id: user.id }, 
        { where: { id: overtime.id }, returning: true }
      )
      sendResponse(200, "Success update Overtime", res)
    }
    catch (err) {
      next(err)
    }
  };
};

module.exports = OvertimeController;