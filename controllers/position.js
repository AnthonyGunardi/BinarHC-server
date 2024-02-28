const { Position } = require('../models');
const { sendData, sendResponse } = require('../helpers/response.js');
const { Op } = require('sequelize');

class PositionController {
  static async create(req, res) {
    const positionData = {
      title: req.body.title, 
      slug: req.body.slug,
      description: req.body.description
    };
    try {
      const isExists = await Position.findOne({
        where: {
          slug: positionData.slug
        }
      })
      if(isExists) return sendResponse(400, "Position already exists", res)
      const position = await Position.create(positionData);
      const { title, slug, description } = position;
      sendData(200, { title, slug, description }, "Success create position", res)
    } 
    catch (error) {
      sendResponse(500, error.message, res)
    }
  }

  static async getPositions(req, res) {
    try {
      const positions = await Position.findAll({
        attributes: ['title', 'slug', 'description', 'updatedAt', 'createdAt']
      })
      sendData(200, positions, "Success Get All Positions", res)
    } catch (error) {
        sendResponse(500, error.message, res)
    };
  };

    static async getPosition(req, res) {
      const slug = req.params.slug
      try {
        const position = await Position.findOne({
            where: { slug },
            attributes:['title', 'slug', 'description']
        })
        if (!position) return sendResponse(404, "Position not found", res)
        sendData(200, position, "Success Get Detail Position", res)
      } 
      catch (error) {
        sendResponse(500, error.message, res)
      }
    }

    static async update(req, res, next) {
      const currentSlug = req.params.slug
      const positionData = {
        title: req.body.title,
        slug: req.body.slug,
        description: req.body.description
      };
      try {
        const position = await Position.findOne({
          where: { slug: currentSlug }
        })
        if (!position) return sendResponse(404, "Position is not found", res)
        const positionWithNewSlug = await Position.findOne({
          where: { 
            [Op.and]: [
              { 
                id: {
                  [Op.ne]: position.id, 
                } 
              },
              { slug: positionData.slug }
          ]
            }
        })
        if (positionWithNewSlug) return sendResponse(403, "Slug is already used", res)
        const updated = await Position.update(positionData, {
          where: { id: position.id },
          returning: true
        })
        sendResponse(200, "Success update position", res)
      }
      catch (err) {
        next(err)
      }
    };
};

module.exports = PositionController;