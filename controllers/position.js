const { Position, User } = require('../models');
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
      //check if position is exist
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
      //check if position is exist
      const position = await Position.findOne({
        where: { slug: currentSlug }
      })
      if (!position) return sendResponse(404, "Position is not found", res)
      
      //check if new slug is already used
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

  static async addUserPosition(req, res, next) {
    try {
      const nip = req.params.nip;
      const { slug } = req.body;

      //get user_id
      const user = await User.findOne({ 
        where: { nip } 
      });
      if (!user) return sendResponse(404, "User is not found", res);

      //check if position is exist
      const position = await Position.findOne({
        where: { slug }
      })
      if(!position) return sendResponse(400, "Position is not exists", res)

      const assigned = await user.addPosition(position, { through: 'User_Position' });
      sendData(200, assigned, "Success assign position", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async removeUserPosition(req, res, next) {
    try {
      const nip = req.params.nip;
      const { slug } = req.body;

      //check if user is exist
      const user = await User.findOne({ 
        where: { nip }
      });
      if (!user) return sendResponse(404, "User is not found", res);

      //check if position is exist
      const position = await Position.findOne({
        where: { slug }
      })
      if(!position) return sendResponse(400, "Position is not exists", res)

      // Check if the position is associated with the user
      const assigned = await user.getPositions( {
        where: { slug }
      });
      if(assigned.length === 0) return sendResponse(400, "Position is not associated with the user", res)

      await user.removePosition(position, { through: 'User_Position' });
      sendResponse(200, "Success remove position", res)  
    }
    catch (err) {
      next(err)
    };
  };
};

module.exports = PositionController;