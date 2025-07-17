const { Schedule } = require('../models/index.js');
const { Sequelize, Op } = require('sequelize');
const { sendResponse, sendData } = require('../helpers/response.js');

class ScheduleController {
  static async create(req, res, next) {
    try {
      const { title, slug, description, link, is_active, publish_date, publish_time, education_id } = req.body;

      //check if schedule slug already exist
      const schedule = await Schedule.findOne({ 
        where: { slug } 
      });
      if (Boolean(schedule)) return sendResponse(400, 'Schedule already exist', res);

      const newSchedule = await Schedule.create(
        { title, slug, description, link, is_active, publish_date, publish_time, education_id }
      );
      sendData(201, { id: newSchedule.id, title: newSchedule.title, slug: newSchedule.slug }, "Success create schedule", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getAllSchedules(req, res, next) {
    try {
      const { education_id } = req.query;
      const filters = {};

      // Apply education_id filter only if education_id is provided
      if (education_id) {
        filters.education_id = education_id;
      }

      const schedules = await Schedule.findAll({
        where: filters,
        order: [['id', 'asc']]
      });
      sendData(200, schedules, "Success get all schedules", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getSchedule(req, res, next) {
    const slug = req.params.slug;
    try {
      const schedule = await Schedule.findOne({
        where: { slug },
        attributes:{
          exclude: ['createdAt', 'updatedAt']
        }
      })
      if (!schedule) return sendResponse(404, "Schedule is not found", res)
      sendData(200, schedule, "Success get schedule data", res)
    } 
    catch (err) {
      next(err)
    }
  }

  static async toggleSchedule(req, res, next) {
    const slug = req.params.slug;
    let scheduleData = {
      is_active: false
    };
    try {
      const schedule = await Schedule.findOne({
        where: { slug }
      })
      if (!schedule) return sendResponse(404, "Schedule is not found", res)
      if (schedule.is_active == false) {
        scheduleData.is_active = true
      }
      const updated = await Schedule.update(scheduleData, {
        where: { slug },
        returning: true
      })
      sendResponse(200, "Success update schedule", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async update(req, res, next) {
    try {
      const currentSlug = req.params.slug;
      const { title, slug, description, link, is_active, publish_date, publish_time, education_id } = req.body;
  
      // Check if schedule slug exists
      const schedule = await Schedule.findOne({
        where: { slug: currentSlug }
      });
      if (!schedule) {
        return sendResponse(404, "Schedule is not found", res);
      }
  
      // Check if new schedule slug is already used
      const scheduleWithNewSlug = await Schedule.findOne({
        where: {
          [Op.and]: [
            { 
              id: { 
                [Op.ne]: schedule.id 
              }
            },
            { slug },
          ],
        }
      });
      if (scheduleWithNewSlug) {
        return sendResponse(403, "Slug already used", res);
      }
  
      // Update schedule
      await Schedule.update(
        { title, slug, description, link, is_active, publish_date, publish_time, education_id },
        { where: { id: schedule.id } }
      );

      sendResponse(200, "Success update schedule", res);
    } catch (err) {
      next(err);
    }
  }
  
};

module.exports = ScheduleController;