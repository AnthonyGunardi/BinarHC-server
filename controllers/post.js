const { Post, User, Event, Post_Gallery } = require('../models/index.js');
const { Op } = require('sequelize');
const fs = require('fs')
const path = require('node:path');
const { sendResponse, sendData } = require('../helpers/response.js');

class PostController {
  static async create(req, res, next) {
    try {
      const user_id = req.user.id
      const { title, slug, description, type, published_at, is_active } = req.body;

      //check if post slug already exist
      const post = await Post.findOne({ 
        where: { slug } 
      });
      if (Boolean(post)) return sendResponse(400, 'Post already exist', res);

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

      const newPost = await Post.create(
        { title, slug, thumbnail: url, description, type, published_at, user_id, is_active }
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

  static async getPostsByScroll(req, res, next) {
    try {
      const lastID = parseInt(req.query.lastID) || 0;
      const limit = parseInt(req.query.limit) || 0;
      const search = req.query.key || "";
      // Menyesuaikan waktu ke GMT+7
      const now = new Date();
      const offset = 7 * 60; // GMT+7 in minute
      const today = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000);
      let result = [];

      if (lastID < 1) {
        //get posts where its title or description is like keyword, and its published date is less than today
        const results = await Post.findAll({
          where: {
            [Op.or]: [
              {title: {
                [Op.like]: '%'+search+'%'
              }}, 
              {description:{
                [Op.like]: '%'+search+'%'
              }}
            ],
            published_at: {
              [Op.lte]: today
            },
            is_active: true
          },
          attributes: {
            exclude: ['user_id']
          },
          include: {
            model: Event,
            attributes: {
              exclude: ['post_id']
            }
          },
          limit: limit,
          order: [
            ['id', 'DESC']
          ]
        })
        result = results
      } else {
        // get posts where its ID is less than lastID, and its title or description is like keyword, and its published date is less than today
        const results = await Post.findAll({
          where: {
            id: {
              [Op.lt]: lastID
            },
            [Op.or]: [
              {title: {
                [Op.like]: '%'+search+'%'
              }}, 
              {description:{
              [Op.like]: '%'+search+'%'
              }}
            ],
            published_at: {
              [Op.lte]: today
            },
            is_active: true
          },
          attributes: {
            exclude: ['user_id']
          },
          include: {
            model: Event,
            attributes: {
              exclude: ['post_id']
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
      sendData(200, payload, "Success get posts data", res)
    } 
    catch (err) {
        next(err)
    };
  };

  static async getPost(req, res, next) {
    try {
      const slug = req.params.slug;

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
    try {
      const slug = req.params.slug
      let postData = {
        is_active: false
      };

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
    try {
      const currentSlug = req.params.slug
      const user_id = req.user.id
      const { title, slug, description, type, published_at, is_active } = req.body;

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
        { title, slug, thumbnail: url, description, type, published_at, user_id, is_active }, 
        { where: { id: post.id }, returning: true }
      )
      sendResponse(200, "Success update post", res)
    }
    catch (err) {
      next(err)
    }
  };
};

module.exports = PostController;