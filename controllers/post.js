const { Posts, User, Events } = require('../models/index.js');
const { sendResponse, sendData } = require('../helpers/response.js');
const { Op } = require('sequelize');
const fs = require('fs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)

class PostController {
  static async create(req, res, next) {
    const email = req.body.email
    const userEmail = req.user.email
    const file = req.file.path || null;
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
      const post = await Posts.findOne({ 
        where: { 
          slug: postData.slug
        } 
      });
      if (!Boolean(post)) {
        const newPost = await Posts.create(postData);
        const { id, name, description, slug } = newPost;
        sendData(201, { id, name, description, slug }, "Success create post", res);  
      } else {
        sendResponse(400, 'Post already exist', res);
      }
    }
    catch (err) {
      await unlinkAsync(req.file.path)
      next(err)
    };
  };

  static async getAllPosts(req, res, next) {
    try {
        const posts = await Posts.findAll({
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
        const post = await Posts.findOne({
            where: { slug },
            attributes:['title', 'slug', 'thumbnail', 'description', 'type', 'is_active', 'published_at', 'createdAt'],
            include: {
              model: Events,
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
      const post = await Posts.findOne({
        where: { slug }
      })
      if (!post) return sendResponse(404, "Post is not found", res)
      if (post.is_active == false) {
        postData.is_active = true
      }
      const updated = await Posts.update(postData, {
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
    const file = req.file.path || null;
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
      const post = await Posts.findOne({
        where: { slug: currentSlug }
      })
      if (!post) return sendResponse(404, "Post is not found", res)
      const postWithNewSlug = await Posts.findOne({
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
      const updated = await Posts.update(postData, {
        where: { id: post.id }
      })
      sendData(200, post, 'success', res)
    }
    catch (err) {
      next(err)
    }
    
  };
};

module.exports = PostController;