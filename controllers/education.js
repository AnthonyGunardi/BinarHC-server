const { Education, Mission_Gallery, Mission_Url } = require('../models/index.js');
const { Op } = require('sequelize');
const fs = require('fs')
const path = require('node:path');
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
      sendData(201, { id: newEducation.id, title: newEducation.title, slug: newEducation.slug, type: newEducation.type }, "Success create education", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getAllEducations(req, res, next) {
    try {
      const { is_active } = req.query;
      const filters = {};

      // Apply is_active filter only if is_active is provided
      if (is_active) {
        filters.is_active = is_active === 'true' ? true : false;
      }

      const educations = await Education.findAll({
        where: filters,
        order: [['id', 'asc']]
      });
      sendData(200, educations, "Success get all educations", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getEducation(req, res, next) {
    const slug = req.params.slug;
    try {
      const education = await Education.findOne({
        where: { slug },
        attributes:{
          exclude: ['createdAt', 'updatedAt']
        },
        order: [['id', 'asc']]
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
    let transaction;
  
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
        { where: { id: education.id }, transaction }
      );

      sendResponse(200, "Success update education", res);
    } catch (err) {
      next(err);
    }
  }
  
};

module.exports = EducationController;