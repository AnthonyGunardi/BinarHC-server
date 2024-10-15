const { Absence, User } = require('../models/index.js');
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
        const file = req.files.file;
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
      sendData(201, { id: newAbsence.id, start_date: newAbsence.start_date, end_date: newAbsence.end_date, type: newAbsence.type, status: newAbsence.status, note: newAbsence.note, employee_id: newAbsence.employee_id }, "Success create absence request", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getAllPosts(req, res, next) {
    try {
      const posts = await Post.findAll({
        attributes:['title', 'slug', 'thumbnail', 'description', 'type', 'is_active', 'published_at', 'createdAt'],
        include: {
          model: Event,
          attributes: {
            exclude: ['post_id']
          }
        },
        order: [['id', 'desc']]
      });
      sendData(200, posts, "Success get all posts", res);
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
    const currentSlug = req.params.slug
    const userEmail = req.user.email
    const { email, title, slug, description, type, published_at, is_active } = req.body;
    try {
      //check if user is exist and is login
      const user = await User.findOne({ 
        where: { email } 
      });
      if (!user || user.email != userEmail) return sendResponse(404, "User is not found", res);

      //check if post slug is exist
      const post = await Post.findOne({
        where: { slug: currentSlug }
      })
      if (!post) return sendResponse(404, "Post is not found", res)

      //upload file if req.files isn't null
      let url;
      if(!req.files) {
        url = post.thumbnail;
      } else {
        const file = req.files.thumbnail;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        url = `thumbnail-posts/${fileName}`;
    
        //validate file type
        if(!allowedType.includes(ext.toLocaleLowerCase())) return sendResponse(422, "File must be image with extension png, jpg, jpeg", res)
        //validate file size max 5mb
        if(fileSize > 5000000) return sendResponse(422, "Image must be less than 5 mb", res)
        //place the file on server
        file.mv(`./public/images/thumbnail-posts/${fileName}`, async (err) => {
          if(err) return sendResponse(502, err.message, res)
        })
        //delete previous file on server
        if (post.thumbnail !== null) {
          const filePath = `./public/images/${post.thumbnail}`;
          fs.unlinkSync(filePath);
        }
      }

      //check if new post slug is already used
      const postWithNewSlug = await Post.findOne({
        where: { 
          [Op.and]: [
            { 
              id: {
                [Op.ne]: post.id, 
              } 
            },
            { slug }
          ]
        }
      })
      if (postWithNewSlug) return sendResponse(403, "Slug already used", res)

      const updatedPost = await Post.update(
        { title, slug, thumbnail: url, description, type, published_at, user_id: user.id, is_active }, 
        { where: { id: post.id }, returning: true }
      )
      sendResponse(200, "Success update post", res)
    }
    catch (err) {
      next(err)
    }
  };
};

module.exports = OvertimeController;