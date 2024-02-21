const { Event, Post } = require('../models/index.js');
const { sendResponse, sendData } = require('../helpers/response.js');

class EventController {
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

  static async getEvent(req, res, next) {
    const id = req.params.id
    try {
        const event = await Event.findOne({
            where: { id },
            attributes:['id', 'title', 'url', 'point', 'published_at', 'post_id', 'is_active', 'createdAt'],
            include: {
              model: Post,
              attributes:['title', 'slug']
            }
        })
        if (!event) return sendResponse(404, "Event is not found", res)
        sendData(200, event, "Success get event data", res)
    } 
    catch (err) {
        next(err)
    }
  }

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
      const eventData = {
        title: req.body.title,
        url: req.body.url,
        point: req.body.point,
        published_at: req.body.published_at || new Date(),
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