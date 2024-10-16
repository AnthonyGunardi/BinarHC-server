const { Absence, User, Biodata, Office, Echelon } = require('../models/index.js');
const { Op } = require('sequelize');
const fs = require('fs')
const path = require('node:path');
const { sendResponse, sendData } = require('../helpers/response.js');

class OvertimeController {
  static async createByEmployee(req, res, next) {
    try {
      const userEmail = req.user.email
      const { start_date, end_date, type, note } = req.body;

      //check if user is exist and is login
      const user = await User.findOne({ 
        where: { email: userEmail } 
      });
      if (!user) return sendResponse(404, "User is not found", res);

      //check if absence already exist
      const absence = await Absence.findOne({ 
        where: { start_date, end_date,employee_id: user.id } 
      });
      if (Boolean(absence)) return sendResponse(400, 'Absence request already exist', res);

      //upload file if req.files isn't null
      let url = null
      if (req.files != null) {
        const file = req.files.photo;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        url = `absence-requests/${fileName}`;

        //validate file type
        if(!allowedType.includes(ext.toLocaleLowerCase())) return sendResponse(422, "File must be image with extension png, jpg, jpeg", res)    
        //validate file size max 5mb
        if(fileSize > 5000000) return sendResponse(422, "Image must be less than 5 mb", res)
        //place the file on server
        file.mv(`./public/images/absence-requests/${fileName}`, async (err) => {
          if(err) return sendResponse(502, err.message, res)
        })
      }

      const newAbsence = await Absence.create(
        { start_date, end_date, photo: url, type, note, employee_id: user.id }
      );
      sendData(201, { id: newAbsence.id, start_date: newAbsence.start_date, end_date: newAbsence.end_date, type: newAbsence.type, status: newAbsence.status, note: newAbsence.note, employee_id: newAbsence.employee_id }, "Berhasil diajukan", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async createByAdmin(req, res, next) {
    try {
      const userEmail = req.user.email
      const { start_date, end_date, type, nip, note } = req.body;

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

      //check if absence already exist
      const absence = await Absence.findOne({ 
        where: { start_date, end_date, employee_id: user.id } 
      });
      if (Boolean(absence)) return sendResponse(400, 'Absence request already exist', res);

      //upload file if req.files isn't null
      let url = null
      if (req.files != null) {
        const file = req.files.photo;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        url = `absence-requests/${fileName}`;

        //validate file type
        if(!allowedType.includes(ext.toLocaleLowerCase())) return sendResponse(422, "File must be image with extension png, jpg, jpeg", res)    
        //validate file size max 5mb
        if(fileSize > 5000000) return sendResponse(422, "Image must be less than 5 mb", res)
        //place the file on server
        file.mv(`./public/images/absence-requests/${fileName}`, async (err) => {
          if(err) return sendResponse(502, err.message, res)
        })
      }

      const newAbsence = await Absence.create(
        { start_date, end_date, photo: url, type, status: 'success',note, employee_id: user.id, admin_id: admin.id }
      );
      sendData(201, { id: newAbsence.id, start_date: newAbsence.start_date, end_date: newAbsence.end_date, type: newAbsence.type, status: newAbsence.status, note: newAbsence.note, employee_id: newAbsence.employee_id }, "Pengajuan absen berhasil", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getAllAbsences(req, res, next) {
    try {
      const { division_slug, start_date, end_date } = req.query;
      const absences = await Absence.findAll({
        where: {
          start_date: {
            [Op.gte]: start_date,
            [Op.lte]: end_date  
          }
        },
        attributes: {
          exclude: ['employee_id', 'admin_id']
        },
        include: [
          {
            model: User,
            as: 'Absence_Requester',
            attributes: {
              exclude: ['createdAt', 'updatedAt']
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
            as: 'Absence_Approver',
            attributes: {
              exclude: ['id', 'email', 'password', 'id_card', 'createdAt', 'updatedAt']
            }
          },
        ],
        order: [['id', 'ASC']]
      });
      sendData(200, absences, "Success get all absences", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getAbsencesByScroll(req, res, next) {
    try {
      const lastID = parseInt(req.query.lastID) || 0;
      const limit = parseInt(req.query.limit) || 0;
      const type = req.query.type || "";
      let result = [];

      if (lastID < 1) {
        //get absences where its type is like keyword
        const results = await Absence.findAll({
          where: {
            type: {
              [Op.like]: '%'+type+'%'
            },
          },
          attributes: {
            exclude: ['employee_id', 'admin_id']
          },
          include: [
            {
              model: User,
              as: 'Absence_Requester',
              attributes: {
                exclude: ['createdAt', 'updatedAt']
              }
            },
            {
              model: User,
              as: 'Absence_Approver',
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
        //get absences where its type is like keyword
        const results = await Absence.findAll({
          where: {
            id: {
              [Op.lt]: lastID
            },
            status: {
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
      sendData(200, payload, "Success get absences data", res)
    } 
    catch (err) {
        next(err)
    };
  };

  static async getUserAbsencesByScroll(req, res, next) {
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
        //get absences where its type is like keyword
        const results = await Absence.findAll({
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
            as: 'Absence_Requester',
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
        //get absences where its type is like keyword
        const results = await Absence.findAll({
          where: {
            id: {
              [Op.lt]: lastID
            },
            status: {
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
      sendData(200, payload, "Success get absences data", res)
    } 
    catch (err) {
        next(err)
    };
  };

  static async getPost(req, res, next) {
    const slug = req.params.slug
    try {
      const post = await Post.findOne({
        where: { slug },
        attributes:['title', 'slug', 'thumbnail', 'description', 'type', 'is_active', 'published_at', 'createdAt'],
        include: [
          {
            model: Event,
            attributes: {
              exclude: ['post_id']
            }
          },
          {
            model: Post_Gallery,
            attributes: {
              exclude: ['post_id']
            }
          }
        ]
      })
      if (!post) return sendResponse(404, "Post is not found", res)
      sendData(200, post, "Success get post data", res)
    } 
    catch (err) {
      next(err)
    }
  }

  static async togglePost(req, res, next) {
    const slug = req.params.slug
    let postData = {
      is_active: false
    };
    try {
      const post = await Post.findOne({
        where: { slug }
      })
      if (!post) return sendResponse(404, "Post is not found", res)
      if (post.is_active == false) {
        postData.is_active = true
      }
      const updated = await Post.update(postData, {
        where: { slug },
        returning: true
      })
      sendResponse(200, "Success update post", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async update(req, res, next) {
    const id = req.params.id
    const userEmail = req.user.email
    const { start_date, end_date, type, status, note } = req.body;
    try {
      //get user_id
      const user = await User.findOne({ 
        where: { email: userEmail } 
      });
      if (!user) return sendResponse(404, "User is not found", res);

      //check if absence is exist
      const absence = await Absence.findOne({
        where: { id }
      })
      if (!absence) return sendResponse(404, "Absence is not found", res)

      //upload file if req.files isn't null
      let url;
      if(!req.files) {
        url = absence.photo;
      } else {
        const file = req.files.photo;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        url = `absence-requests/${fileName}`;
    
        //validate file type
        if(!allowedType.includes(ext.toLocaleLowerCase())) return sendResponse(422, "File must be image with extension png, jpg, jpeg", res)
        //validate file size max 5mb
        if(fileSize > 5000000) return sendResponse(422, "Image must be less than 5 mb", res)
        //place the file on server
        file.mv(`./public/images/absence-requests/${fileName}`, async (err) => {
          if(err) return sendResponse(502, err.message, res)
        })
        //delete previous file on server
        if (absence.photo !== null) {
          const filePath = `./public/images/${absence.photo}`;
          fs.unlinkSync(filePath);
        }
      }

      const updatedAbsence = await Absence.update(
        { start_date, end_date, photo: url,type, status, note, admin_id: user.id }, 
        { where: { id: absence.id }, returning: true }
      )
      sendResponse(200, "Success update Absence", res)
    }
    catch (err) {
      next(err)
    }
  };
};

module.exports = OvertimeController;