const { Post, User, Event } = require('../models/index.js');
const { sendResponse, sendData } = require('../helpers/response.js');
const { Op } = require('sequelize');
const fs = require('fs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)
const path = require('node:path');
const moment = require('moment');
const {createTimeStamp} = require('../helpers/timestamp.js');

class PostController {
  static async create(req, res, next) {
    const email = req.body.email
    const userEmail = req.user.email
    const file = req.file?.path || null;
    // try {
    //   const user = await User.findOne({ 
    //     where: { email } 
    //   });
    //   if (!user || user.email != userEmail) return sendResponse(404, "User is not found", res);
    //   const postData = {
    //     title: req.body.title, 
    //     slug: req.body.slug,
    //     thumbnail: file,
    //     description: req.body.description,
    //     type: req.body.type,
    //     published_at: req.body.published_at || new Date(),
    //     user_id: user.id,
    //     is_active: req.body.is_active
    //   };
    //   const post = await Post.findOne({ 
    //     where: { 
    //       slug: postData.slug
    //     } 
    //   });
    //   if (!Boolean(post)) {
    //     const newPost = await Post.create(postData);
    //     const { id, name, description, slug } = newPost;
    //     if (postData.type == 'event') {
    //       const newEvent = await Event.create({ post_id: id, is_active: false });
    //     }
    //     sendData(201, { id, name, description, slug }, "Success create post", res);  
    //   } else {
    //     sendResponse(400, 'Post already exist', res);
    //   }
    // }
    // catch (err) {
    //   await unlinkAsync(req.file.path)
    //   next(err)
    // };
  };

  static async create2(req, res, next) {
    // if (req.files === null) return sendResponse(400, "Image null", res) 
    const email = req.body.email
    const userEmail = req.user.email
    let url = null
    if (req.files !== null) {
      const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file?.name);
    const fileName = file.md5 + ext;
    url = `thumbnail-posts/${fileName}`;

    //validation type file
    const allowedType = ['.png', '.jpg', '.jpeg'];
    if(!allowedType.includes(ext.toLocaleLowerCase())) return sendResponse(422, "File must be image with extension png, jpg, jpeg", res)
    
    //validation size file max 5mb
    if(fileSize > 5000000) return sendResponse(422, "Image must be less than 5 mb", res)
    
    file.mv(`./public/images/thumbnail-posts/${fileName}`, async (err) => {
        //validation process upload file to server
        if(err) return sendResponse(502, err.message, res)
      })
    }
    
        try {
          const user = await User.findOne({ 
            where: { email } 
          });
          if (!user || user.email != userEmail) return sendResponse(404, "User is not found", res);
          const postData = {
            title: req.body.title, 
            slug: req.body.slug,
            thumbnail: url,
            description: req.body.description,
            type: req.body.type,
            published_at: req.body.published_at,
            user_id: user.id,
            is_active: req.body.is_active
          };
          const post = await Post.findOne({ 
            where: { 
              slug: postData.slug
            } 
          });

          if (!Boolean(post)) {
            const newPost = await Post.create(postData);
            const { id, name, description, slug, thumbnail } = newPost;
            sendData(201, { id, name, description, slug, thumbnail }, "Success create post", res);  
          } else {
            sendResponse(400, 'Post already exist', res);
          }
        }
        catch (err) {
          // await unlinkAsync(req.file.path)
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
    const file = req.file?.path || null;
    try {
      const user = await User.findOne({ 
        where: { email } 
      });
      if (!user || user.email != userEmail) return sendResponse(404, "User is not found", res);
      const postData = {
        title: req.body.title, 
        slug: req.body.slug,
        thumbnail: file,
        description: req.body.description,
        type: req.body.type,
        published_at: req.body.published_at || new Date(),
        user_id: user.id,
        is_active: req.body.is_active
      };
      const post = await Post.findOne({
        where: { slug: currentSlug }
      })
      if (!post) return sendResponse(404, "Post is not found", res)
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

  static async update2(req, res, next) {

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
        const file = req.files.thumbnail;
        const fileSize = file.data.length;
        const ext = path.extname(file?.name);
        const fileName = file.md5 + ext;
        url = `thumbnail-posts/${fileName}`;
    
        //validation type file
        const allowedType = ['.png', '.jpg', '.jpeg'];
        if(!allowedType.includes(ext.toLocaleLowerCase())) return sendResponse(422, "File must be image with extension png, jpg, jpeg", res)
        
        //validation size file max 5mb
        if(fileSize > 5000000) return sendResponse(422, "Image must be less than 5 mb", res)
        
        file.mv(`./public/images/thumbnail-posts/${fileName}`, async (err) => {
            //validation process upload file to server
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
        // published_at: req.body.published,
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