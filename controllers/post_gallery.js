const { Post_Gallery, Post, User, Event } = require('../models/index.js');
const { Op } = require('sequelize');
const fs = require('fs')
const path = require('node:path');
const { sendResponse, sendData } = require('../helpers/response.js');

class PostGalleryController {
  static async create(req, res, next) {
    try {
      const slug = req.params.slug;
      const email = req.user.email
      const { title } = req.body;

      //check if user is exist
      const user = await User.findOne({ 
        where: { email } 
      });
      if (!user) return sendResponse(404, "User is not found", res);

      //get post_id
      const post = await Post.findOne({ 
        where: { slug } 
      });
      if (!post) return sendResponse(404, 'Post is not found', res);

      //upload file if req.files isn't null
      let url = null
      if (req.files !== null) {
        const file = req.files.file;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        url = `post-galleries/${fileName}`;

        //validate file type
        if(!allowedType.includes(ext.toLocaleLowerCase())) return sendResponse(422, "File must be image with extension png, jpg, jpeg", res)    
        //validate file size max 5mb
        if(fileSize > 5000000) return sendResponse(422, "Image must be less than 5 mb", res)
        //place the file on server
        file.mv(`./public/images/post-galleries/${fileName}`, async (err) => {
          if(err) return sendResponse(502, err.message, res)
        })
      }

      const newGallery = await Post_Gallery.create( { title, path: url, post_id: post.id } );
      sendData(201, { id: newGallery.id, title: newGallery.title }, "Success create post gallery", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getGalleries(req, res, next) {
    const slug = req.params.slug;
    try {
      //get post_id
      const post = await Post.findOne({ 
        where: { slug } 
      });
      if (!post) return sendResponse(404, 'Post is not found', res);

      const galleries = await Post_Gallery.findAll({
        where: { post_id: post.id },
        attributes: {
          exclude: ['post_id']
        },
        order: [['title', 'asc']]
      });
      sendData(200, galleries, "Success get all post galleries", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getGallery(req, res, next) {
    const id = req.params.id;
    try {
      const gallery = await Post_Gallery.findOne({
        where: { id },
        include: {
          model: Post,
          attributes: {
            exclude: ['id', 'user_id']
          },
        }
      })
      if (!gallery) return sendResponse(404, "Post gallery is not found", res)
      sendData(200, gallery, "Success get post gallery data", res)
    } 
    catch (err) {
      next(err)
    }
  }

  static async update(req, res, next) {
    const id = req.params.id
    const { title } = req.body;
    try {
      //check if post gallery is exist
      const gallery = await Post_Gallery.findOne({
        where: { id }
      })
      if (!gallery) return sendResponse(404, "Post gallery is not found", res)

      //upload file if req.files isn't null
      let url;
      if(!req.files) {
        url = gallery.path;
      } else {
        const file = req.files.file;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        url = `post-galleries/${fileName}`;
    
        //validate file type
        if(!allowedType.includes(ext.toLocaleLowerCase())) return sendResponse(422, "File must be image with extension png, jpg, jpeg", res)
        //validate file size max 5mb
        if(fileSize > 5000000) return sendResponse(422, "Image must be less than 5 mb", res)
        //place the file on server
        file.mv(`./public/images/post-galleries/${fileName}`, async (err) => {
          if(err) return sendResponse(502, err.message, res)
        })
        //delete previous file on server
        if (gallery.path !== null) {
          const filePath = `./public/images/${gallery.path}`;
          fs.unlinkSync(filePath);
        }
      }

      const updated = await Post_Gallery.update(
        { title, path: url }, 
        { where: { id }, returning: true }
      )
      sendResponse(200, "Success update post gallery", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async delete(req, res, next) {
    const id = req.params.id
    try {
      //check if post gallery is exist
      const gallery = await Post_Gallery.findOne({
        where: { id }
      })
      if (!gallery) return sendResponse(404, "Post gallery is not found", res)
      
      //delete previous file on server
      if (gallery.path !== null) {
        const filePath = `./public/images/${gallery.path}`;
        fs.unlinkSync(filePath);
      }

      const deleted = await Post_Gallery.destroy({ where: { id } })
      sendResponse(200, "Success delete post gallery", res)
    }
    catch (err) {
      next(err)
    }
  }
};

module.exports = PostGalleryController;