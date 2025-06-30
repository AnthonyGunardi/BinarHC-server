const { Mission_Url, Mission } = require('../models/index.js');
const fs = require('fs')
const path = require('node:path');
const { sendResponse, sendData } = require('../helpers/response.js');

class MissionUrlController {
  static async create(req, res, next) {
    try {
      const slug = req.params.slug;
      const { title, url } = req.body;

      // Check if mission slug exists
      const mission = await Mission.findOne({
        where: { slug }
      });
      if (!mission) {
        return sendResponse(404, "Mission is not found", res);
      }

      const newUrl = await Mission_Url.create( { title, url, mission_id: mission.id } );
      sendData(201, { id: newUrl.id, title: newUrl.title, url: newUrl.url }, "Success create mission URL", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getUrl(req, res, next) {
    const slug = req.params.slug;
    try {
      // Check if mission slug exists
      const mission = await Mission.findOne({
        where: { slug }
      });
      if (!mission) return sendResponse(404, "Mission is not found", res);

      const url = await Mission_Url.findOne({
        where: { mission_id: mission.id },
        attributes: {
          exclude: ['mission_id', 'createdAt', 'updatedAt']
        },
        include: {
          model: Mission,
          attributes: {
            exclude: ['id', 'createdAt', 'updatedAt']
          },
        }
      })
      if (!url) return sendResponse(404, "Mission URL is not found", res)
      sendData(200, url, "Success get mission URL", res)
    } 
    catch (err) {
      next(err)
    }
  }

  static async update(req, res, next) {
    try {
      const id = req.params.id
      const { title, url } = req.body;

      //check if mission url is exist
      const mission_url = await Mission_Url.findOne({
        where: { id }
      })
      if (!mission_url) return sendResponse(404, "Mission URL is not found", res)

      //check if url is already used
      const urlExist = await Mission_Url.findOne({
        where: { 
          url, 
          id: { 
            [Op.ne]: id 
          } 
        }
      })
      if (urlExist) return sendResponse(409, "URL is already used", res)

      const updated = await Mission_Url.update(
        { title, url }, 
        { where: { id }, returning: true}
      )
      sendResponse(200, "Success update mission URL", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async delete(req, res, next) {
    const id = req.params.id
    try {
      //check if mission url is exist
      const url = await Mission_Url.findOne({
        where: { id }
      })
      if (!url) return sendResponse(404, "Mission URL is not found", res)

      await Mission_Url.destroy({ where: { id } })
      sendResponse(200, "Success delete mission URL", res)
    }
    catch (err) {
      next(err)
    }
  }
};

module.exports = MissionUrlController;