const { Post, User, Event } = require('../models/index.js');
const { Op } = require('sequelize');
const fs = require('fs')
const path = require('node:path');
const { sendResponse, sendData } = require('../helpers/response.js');
const { createTimeStamp } = require('../helpers/timestamp.js');

class PostController {
  static async create(req, res, next) {
    //upload file if req.files isn't null
    let url = null
    if (req.files !== null) {
      const file = req.files.file;
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
    }
    
    try {
      const userEmail = req.user.email
      const { email, title, slug, description, type, published_at, is_active } = req.body;

      //check if user is exist and is login
      const user = await User.findOne({ 
        where: { email } 
      });
      if (!user || user.email != userEmail) return sendResponse(404, "User is not found", res);

      //check if post slug already exist
      const post = await Post.findOne({ 
        where: { slug } 
      });
      if (Boolean(post)) return sendResponse(400, 'Post already exist', res);

      const newPost = await Post.create(
        { title, slug, thumbnail: url, description, type, published_at, user_id: user.id, is_active }
      );
      sendData(201, { id: newPost.id, name: newPost.name, slug: newPost.slug, description: newPost.description }, "Success create post", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getAllPosts(req, res, next) {
    try {
      const posts = await Post.findAll({
        attributes:['title', 'slug', 'thumbnail', 'description', 'type', 'is_active', 'published_at', 'createdAt'],
        order: [['createdAt', 'desc']]
      });
      sendData(200, posts, "Success get all posts", res);
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
        include: {
          model: Event,
          attributes:['title']
        }
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
    const email = req.body.email
    const userEmail = req.user.email

    try {
      const user = await User.findOne({ 
        where: { email } 
      });
      if (!user || user.email != userEmail) return sendResponse(404, "User is not found", res);

      const post = await Post.findOne({
        where: { slug: currentSlug }
      })
      if (!post) return sendResponse(404, "Post is not found", res)
      let url;
      if(req.files === null) {
        url = post.thumbnail;
      } else {
        //upload file if req.files isn't null
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
        if (post.thumbnail !== null) {
          const filePath = `./public/images/${post.thumbnail}`;
          fs.unlinkSync(filePath);
        }
      }
      const timeStamp = createTimeStamp(req.body.scheduleDate, req.body.scheduleTime)
      const date = new Date(timeStamp)
      const postData = {
        title: req.body.title, 
        slug: req.body.slug,
        thumbnail: url,
        description: req.body.description,
        type: req.body.type,
        published_at: date,
        user_id: user.id,
        is_active: req.body.is_active
      };
      const postWithNewSlug = await Post.findOne({
        where: { 
          [Op.and]: [
            { 
              id: {
                [Op.ne]: post.id, 
              } 
            },
            { slug: postData.slug }
        ]
          }
      })
      if (postWithNewSlug) return sendResponse(403, "Slug already used", res)
      const updated = await Post.update(postData, {
        where: { id: post.id },
        returning: true
      })
      sendResponse(200, "Success update post", res)
    }
    catch (err) {
      next(err)
    }
  };
};

module.exports = PostController;