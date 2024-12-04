const { Employment_Status } = require('../models/index.js');
const { Op } = require('sequelize');
const fs = require('fs')
const path = require('node:path');
const { sendResponse, sendData } = require('../helpers/response.js');

class EmploymentStatusController {
  static async create(req, res, next) {
    try {
      const { name, is_active } = req.body;

      //check if employment status already exist
      const status = await Employment_Status.findOne({ 
        where: { name } 
      });
      if (Boolean(status)) return sendResponse(400, 'Employment status already exist', res);

      const newStatus = await Employment_Status.create(
        { name, is_active }
      );
      sendData(201, { id: newStatus.id, name: newStatus.name, is_active: newStatus.is_active }, "Success create employment status", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getAllStatuses(req, res, next) {
    try {
      const statuses = await Employment_Status.findAll({
        order: [['id', 'asc']]
      });
      sendData(200, statuses, "Success get all employment statuses", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getStatus(req, res, next) {
    const id = req.params.id;
    try {
      const status = await Employment_Status.findOne({
        where: { id }
      })
      if (!status) return sendResponse(404, "Employment status is not found", res)
      sendData(200, status, "Success get employment status data", res)
    } 
    catch (err) {
      next(err)
    }
  }

  static async toggleStatus(req, res, next) {
    const id = req.params.id
    let statusData = {
      is_active: false
    };
    try {
      const status = await Employment_Status.findOne({
        where: { id }
      })
      if (!status) return sendResponse(404, "Employment status is not found", res)
      if (status.is_active == false) {
        statusData.is_active = true
      }
      const updated = await Employment_Status.update(statusData, {
        where: { id },
        returning: true
      })
      sendResponse(200, "Success update employment status", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async update(req, res, next) {
    const id = req.params.id
    const { name, is_active } = req.body;
    try {
      //check if rmployment status is exist
      const status = await Employment_Status.findOne({
        where: { id }
      })
      if (!status) return sendResponse(404, "Employment status is not found", res)

      //check if new employment status name is already used
      const statusWithNewName = await Employment_Status.findOne({
        where: { 
          [Op.and]: [
            { 
              id: {
                [Op.ne]: id, 
              } 
            },
            { name: status.name }
          ]
        }
      })
      if (statusWithNewName) return sendResponse(403, "Employment status name already exist", res)

      const updatedStatus = await Employment_Status.update(
        { name, is_active }, 
        { where: { id: status.id }, returning: true }
      )
      sendResponse(200, "Success update employment status", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async delete(req, res, next) {
    const id = req.params.id
    try {
      //Check if employment status is exist
      const status = await Employment_Status.findOne({
        where: { id }
      })
      if (!status) return sendResponse(404, "Employment Status is not found", res)

      const deleted = await Employment_Status.destroy({ where: { id } })
      sendResponse(200, "Success delete employment status", res)
    }
    catch (err) {
      next(err)
    }
  }
};

module.exports = EmploymentStatusController;