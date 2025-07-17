const { Education, Sub_Education, Schedule } = require('../models/index.js');
const { Sequelize, Op } = require('sequelize');
const { sendResponse, sendData } = require('../helpers/response.js');

class EducationController {
  static async create(req, res, next) {
    try {
      const { title, slug, description, certification, is_restream, is_public, is_active, publish_date, publish_time } = req.body;

      //check if education slug already exist
      const education = await Education.findOne({ 
        where: { slug } 
      });
      if (Boolean(education)) return sendResponse(400, 'Education already exist', res);

      const newEducation = await Education.create(
        { title, slug, description, certification, is_restream, is_public, is_active, publish_date, publish_time }
      );
      sendData(201, { id: newEducation.id, title: newEducation.title, slug: newEducation.slug }, "Success create education", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getAllEducations(req, res, next) {
    try {
      const lastID = parseInt(req.query.lastID) || 0;
      const limit = parseInt(req.query.limit) || 0;
      const search = req.query.key || "";

      // Adjust time to GMT+7
      const now = new Date();
      const offset = 7 * 60;
      const today = new Date(now.getTime() + (offset - now.getTimezoneOffset()) * 60000);
      const todayISOString = today.toISOString().slice(0, 19).replace('T', ' '); // 'YYYY-MM-DD HH:MM:SS'

      // Base WHERE clause
      const baseWhere = {
        [Op.and]: [
          Sequelize.literal(`CONCAT(publish_date, ' ', publish_time) <= '${todayISOString}'`)
        ],
        is_active: true,
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ]
      };

      if (lastID > 0) {
        baseWhere.id = { [Op.lt]: lastID };
      }

      const results = await Education.findAll({
        where: baseWhere,
        include: [
          {
            model: Sub_Education,
            attributes: {
              exclude: ['education_id', 'createdAt', 'updatedAt']
            }
          },
          {
            model: Schedule,
            attributes: {
              exclude: ['createdAt', 'updatedAt']
            }
          }
        ],
        limit: limit,
        order: [['id', 'DESC']]
      });

      const payload = {
        datas: results,
        lastID: results.length ? results[results.length - 1].id : 0,
        hasMore: results.length >= limit
      };

      sendData(200, payload, "Success get educations data", res);
    } catch (err) {
      next(err);
    }
  }

  static async getEducation(req, res, next) {
    const slug = req.params.slug;
    try {
      const education = await Education.findOne({
        where: { slug },
        attributes:{
          exclude: ['createdAt', 'updatedAt']
        },
        include: [
          {
            model: Sub_Education,
            attributes: {
              exclude: ['education_id']
            }
          },
          {
            model: Schedule,
            attributes: {
              exclude: ['createdAt', 'updatedAt']
            }
          }
        ],
      })
      if (!education) return sendResponse(404, "Education is not found", res)
      sendData(200, education, "Success get education data", res)
    } 
    catch (err) {
      next(err)
    }
  }

  static async toggleEducation(req, res, next) {
    const slug = req.params.slug;
    let educationData = {
      is_active: false
    };
    try {
      const education = await Education.findOne({
        where: { slug }
      })
      if (!education) return sendResponse(404, "Education is not found", res)
      if (education.is_active == false) {
        educationData.is_active = true
      }
      const updated = await Education.update(educationData, {
        where: { slug },
        returning: true
      })
      sendResponse(200, "Success update education", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async update(req, res, next) {
    try {
      const currentSlug = req.params.slug;
      const { title, slug, description, certification, is_restream, is_public, is_active, publish_date, publish_time } = req.body;
  
      // Check if education slug exists
      const education = await Education.findOne({
        where: { slug: currentSlug }
      });
      if (!education) {
        return sendResponse(404, "Education is not found", res);
      }
  
      // Check if new education slug is already used
      const educationWithNewSlug = await Education.findOne({
        where: {
          [Op.and]: [
            { 
              id: { 
                [Op.ne]: education.id 
              }
            },
            { slug },
          ],
        }
      });
      if (educationWithNewSlug) {
        return sendResponse(403, "Slug already used", res);
      }
  
      // Update education
      await Education.update(
        { title, slug, description, certification, is_restream, is_public, is_active, publish_date, publish_time },
        { where: { id: education.id } }
      );

      sendResponse(200, "Success update education", res);
    } catch (err) {
      next(err);
    }
  }
  
};

module.exports = EducationController;