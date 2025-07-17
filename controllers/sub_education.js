const { Sub_Education, Education } = require('../models/index.js');
const { Op } = require('sequelize');
const { sendResponse, sendData } = require('../helpers/response.js');

class SubEducationController {
  static async create(req, res, next) {
    try {
      const { title, slug, description, link, is_active, education_id } = req.body;

      //check if sub education slug already exist
      const sub_education = await Sub_Education.findOne({ 
        where: { slug } 
      });
      if (Boolean(sub_education)) return sendResponse(400, 'Sub Education already exist', res);

      const newEducation = await Sub_Education.create(
        { title, slug, description, link, is_active, education_id }
      );
      sendData(201, { id: newEducation.id, title: newEducation.title, slug: newEducation.slug }, "Success create sub education", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getAllSubEducations(req, res, next) {
    try {
      const { education_id } = req.query;
      const filters = {};

      // Apply education_id filter only if education_id is provided
      if (education_id) {
        filters.education_id = education_id;
      }

      const sub_educations = await Sub_Education.findAll({
        where: filters,
        order: [['id', 'asc']]
      });
      sendData(200, sub_educations, "Success get all sub educations", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getSubEducation(req, res, next) {
    const slug = req.params.slug;
    try {
      const sub_education = await Sub_Education.findOne({
        where: { slug },
        attributes:{
          exclude: ['createdAt', 'updatedAt']
        }
      })
      if (!sub_education) return sendResponse(404, "Sub Education is not found", res)
      sendData(200, sub_education, "Success get sub education data", res)
    } 
    catch (err) {
      next(err)
    }
  }

  static async toggleSubEducation(req, res, next) {
    const slug = req.params.slug;
    let educationData = {
      is_active: false
    };
    try {
      const sub_education = await Sub_Education.findOne({
        where: { slug }
      })
      if (!sub_education) return sendResponse(404, "Education is not found", res)
      if (sub_education.is_active == false) {
        educationData.is_active = true
      }
      const updated = await Sub_Education.update(educationData, {
        where: { slug },
        returning: true
      })
      sendResponse(200, "Success update sub_education", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async update(req, res, next) {
    try {
      const currentSlug = req.params.slug;
      const { title, slug, description, link, is_active, education_id } = req.body;
  
      // Check if education slug exists
      const sub_education = await Sub_Education.findOne({
        where: { slug: currentSlug }
      });
      if (!sub_education) {
        return sendResponse(404, "Sub Education is not found", res);
      }
  
      // Check if new education slug is already used
      const subEducationWithNewSlug = await Sub_Education.findOne({
        where: {
          [Op.and]: [
            { 
              id: { 
                [Op.ne]: sub_education.id 
              }
            },
            { slug },
          ],
        }
      });
      if (subEducationWithNewSlug) {
        return sendResponse(403, "Slug already used", res);
      }
  
      // Update sub education
      await Sub_Education.update(
        { title, slug, description, link, is_active, education_id },
        { where: { id: sub_education.id } }
      );

      sendResponse(200, "Success update sub education", res);
    } catch (err) {
      next(err);
    }
  }
  
};

module.exports = SubEducationController;