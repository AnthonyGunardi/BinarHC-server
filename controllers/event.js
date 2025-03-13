const { Event, Post, Post_Gallery,User } = require('../models/index.js');
const { sendResponse, sendData } = require('../helpers/response.js');

class EventController {
  static async create(req, res, next) {
    try {
      const slug = req.params.slug;
      const email = req.user.email
      const { title, url, point, published_at, is_active } = req.body;

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

      //check if event is exist
      const event = await Event.findOne({ 
        where: { post_id: post }
      });
      if (event) return sendResponse(422, `Event with title "${title}" is already exist`, res);

      const newEvent = await Event.create( { title, url, point, published_at, post_id: post.id, is_active } );
      sendData(201, { id: newEvent.id, title: newEvent.title }, "Success create event", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getAllEvents(req, res, next) {
    try {
        const events = await Event.findAll({
          attributes:['id', 'title', 'url', 'point', 'published_at', 'post_id', 'is_active', 'createdAt'],
          order: [['createdAt', 'desc']]
        });
        sendData(200, events, "Success get all events", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getEventBySlug(req, res, next) {
    const slug = req.params.slug;
    try {
      //get post_id
      const post = await Post.findOne({ 
        where: { slug } 
      });
      if (!post) return sendResponse(404, 'Post is not found', res);

      const event = await Event.findAll({
        where: { post_id: post.id },
        attributes: {
          exclude: ['post_id']
        },
        include: {
          model: Post,
          attributes: {
            exclude: ['user_id']
          },
          include: {
            model: Post_Gallery,
            attributes: {
              exclude: ['post_id']
            }
          }
        },
        order: [['title', 'asc']]
      });
      sendData(200, event, "Success get events data", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async toggleEvent(req, res, next) {
    const id = req.params.id
    let eventData = {
      is_active: false
    };
    try {
      const event = await Event.findOne({
        where: { id }
      })
      if (!event) return sendResponse(404, "Event is not found", res)
      if (event.is_active == false) {
        eventData.is_active = true
      }
      const updated = await Event.update(eventData, {
        where: { id },
        returning: true
      })
      sendResponse(200, "Success update event", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async update(req, res, next) {
    const id = req.params.id
    try {
      const now = new Date();

      // Menyesuaikan waktu ke GMT+7
      const offset = 7 * 60; // GMT+7 in minute
      const localTime = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000);

      const eventData = {
        title: req.body.title,
        url: req.body.url,
        point: req.body.point,
        published_at: req.body.published_at || localTime,
        is_active: req.body.is_active
      };
      const event = await Event.findOne({
        where: { id }
      })
      if (!event) return sendResponse(404, "Event is not found", res)
      const updated = await Event.update(eventData, {
        where: { id },
        returning: true
      })
      sendResponse(200, "Success update event", res)
    }
    catch (err) {
      next(err)
    }
    
  };
};

module.exports = EventController;