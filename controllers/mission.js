const { Mission, Mission_Gallery, Mission_Url } = require('../models/index.js');
const { Op } = require('sequelize');
const fs = require('fs')
const path = require('node:path');
const { sendResponse, sendData } = require('../helpers/response.js');

class MissionController {
  static async create(req, res, next) {
    try {
      const { title, slug, type, published_at, expired_at } = req.body;

      //check if mission slug already exist
      const mission = await Mission.findOne({ 
        where: { slug } 
      });
      if (Boolean(mission)) return sendResponse(400, 'Mission already exist', res);

      //upload file if req.files isn't null
      let url = null
      if (req.files !== null) {
        const file = req.files.file;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        url = `mission-thumbnails/${fileName}`;

        //validate file type
        if(!allowedType.includes(ext.toLocaleLowerCase())) return sendResponse(422, "File must be image with extension png, jpg, jpeg", res)    
        //validate file size max 5mb
        if(fileSize > 5000000) return sendResponse(422, "Image must be less than 5 mb", res)
        //place the file on server
        file.mv(`./public/images/mission-thumbnails/${fileName}`, async (err) => {
          if(err) return sendResponse(502, err.message, res)
        })
      }

      const newMission = await Mission.create(
        { title, slug, thumbnail: url, type, published_at, expired_at }
      );
      sendData(201, { id: newMission.id, title: newMission.title, slug: newMission.slug, type: newMission.type }, "Success create mission", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getAllMissions(req, res, next) {
    try {
      const { is_active } = req.query;
      // Menyesuaikan waktu ke GMT+7
      const now = new Date();
      const offset = 7 * 60; // GMT+7 in minute
      const today = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000);
      const filters = {};
    
      filters.published_at = {
        [Op.lte]: today
      };

      // Apply is_active filter only if is_active is provided
      if (is_active) {
        filters.is_active = is_active === 'true' ? true : false;
      }

      const missions = await Mission.findAll({
        where: {
          filters
        },
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
        include: [
          {
            model: Mission_Gallery,
            attributes: {
              exclude: ['mission_id', 'createdAt', 'updatedAt']
            }
          },
          {
            model: Mission_Url,
            attributes: {
              exclude: ['mission_id', 'createdAt', 'updatedAt']
            }
          }
        ],
        order: [['id', 'asc']]
      });
      sendData(200, missions, "Success get all missions", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getMission(req, res, next) {
    const slug = req.params.slug
    try {
      const mission = await Mission.findOne({
        where: { slug },
        attributes:{
          exclude: ['createdAt', 'updatedAt']
        },
        include: [
          {
            model: Mission_Gallery,
            attributes: {
              exclude: ['mission_id', 'createdAt', 'updatedAt']
            }
          },
          {
            model: Mission_Url,
            attributes: {
              exclude: ['mission_id', 'createdAt', 'updatedAt']
            }
          }
        ],
        order: [['id', 'asc']]
      })
      if (!mission) return sendResponse(404, "Mission is not found", res)
      sendData(200, mission, "Success get mission data", res)
    } 
    catch (err) {
      next(err)
    }
  }

  static async toggleMission(req, res, next) {
    const slug = req.params.slug
    let missionData = {
      is_active: false
    };
    try {
      const mission = await Mission.findOne({
        where: { slug }
      })
      if (!mission) return sendResponse(404, "Mission is not found", res)
      if (mission.is_active == false) {
        missionData.is_active = true
      }
      const updated = await Mission.update(missionData, {
        where: { slug },
        returning: true
      })
      sendResponse(200, "Success update mission", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async update(req, res, next) {
    let transaction;
    let uploadedFilePath = null; // Store file path in case of rollback
  
    try {
      transaction = await sequelize.transaction();
      const currentSlug = req.params.slug;
      const { title, slug, type, published_at, expired_at } = req.body;
  
      // Check if mission slug exists
      const mission = await Mission.findOne({
        where: { slug: currentSlug }
      });
      if (!mission) {
        return sendResponse(404, "Mission is not found", res);
      }
  
      // Upload file if req.files exists
      let url = mission.thumbnail;
      if (req.files) {
        const file = req.files.file;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        url = `mission-thumbnails/${fileName}`;
        uploadedFilePath = `./public/images/${url}`; // Store uploaded file path
  
        // Validate file type
        if (!allowedType.includes(ext.toLowerCase())) {
          return sendResponse(422, "File must be an image with extension png, jpg, jpeg", res);
        }  
        // Validate file size (max 5MB)
        if (fileSize > 5000000) {
          return sendResponse(422, "Image must be less than 5 MB", res);
        } 
        // Move file to the server
        await file.mv(uploadedFilePath);  
        // Delete previous file if exists
        if (mission.thumbnail) {
          const filePath = `./public/images/${mission.thumbnail}`;
          if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
          }
        }
      }
  
      // Check if new mission slug is already used
      const missionWithNewSlug = await Mission.findOne({
        where: {
          [Op.and]: [
            { 
              id: { 
                [Op.ne]: mission.id 
              }
            },
            { slug },
          ],
        }
      });
      if (missionWithNewSlug) {
        return sendResponse(403, "Slug already used", res);
      }
  
      // Update mission
      await Mission.update(
        { title, slug, thumbnail: url, type, published_at, expired_at },
        { where: { id: mission.id }, transaction }
      );
  
      await transaction.commit();
      sendResponse(200, "Success update mission", res);
    } catch (err) {
      // Rollback the transaction in case of an error
      if (transaction) await transaction.rollback();
  
      // Delete old uploaded file if it exists
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        await fs.promises.unlink(uploadedFilePath);
      }
  
      next(err);
    }
  }
  
};

module.exports = MissionController;