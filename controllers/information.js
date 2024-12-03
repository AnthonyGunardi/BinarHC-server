const { Information } = require('../models/index.js');
const { Op } = require('sequelize');
const fs = require('fs')
const path = require('node:path');
const { sendResponse, sendData } = require('../helpers/response.js');

class InformationController {
  static async create(req, res, next) {
    try {
      const { title, type, description } = req.body;

      //check if information type already exist
      const info = await Information.findOne({ 
        where: { type } 
      });
      if (Boolean(info)) return sendResponse(400, 'Information type already exist', res);

      const newInfo = await Information.create(
        { title, type, description }
      );
      sendData(201, { id: newInfo.id, title: newInfo.title, type: newInfo.type }, "Success create information", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getAllInformations(req, res, next) {
    try {
      const infos = await Information.findAll({
        order: [['id', 'asc']]
      });
      sendData(200, infos, "Success get all informations", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getInformation(req, res, next) {
    const id = req.params.id;
    try {
      const info = await Information.findOne({
        where: { id }
      })
      if (!info) return sendResponse(404, "Information is not found", res)
      sendData(200, info, "Success get information data", res)
    } 
    catch (err) {
      next(err)
    }
  }

  static async getInformationByType(req, res, next) {
    const type = req.params.type
    try {
      const info = await Information.findOne({
        where: { type }
      })
      if (!info) return sendResponse(404, "Information is not found", res)
      sendData(200, info, "Success get information data", res)
    } 
    catch (err) {
      next(err)
    }
  }

  static async update(req, res, next) {
    const id = req.params.id
    const { title, type, description } = req.body;
    try {
      //check if information is exist
      const info = await Information.findOne({
        where: { id }
      })
      if (!info) return sendResponse(404, "Information is not found", res)

      //check if new information type is already used
      const infoWithNewType = await Information.findOne({
        where: { 
          [Op.and]: [
            { 
              id: {
                [Op.ne]: id, 
              } 
            },
            { type: info.title }
          ]
        }
      })
      if (infoWithNewType) return sendResponse(403, "Information Type already exist", res)

      const updatedInfo = await Information.update(
        { title, type, description }, 
        { where: { id: info.id }, returning: true }
      )
      sendResponse(200, "Success update information", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async delete(req, res, next) {
    const id = req.params.id
    try {
      //Check if information is exist
      const info = await Information.findOne({
        where: { id }
      })
      if (!info) return sendResponse(404, "Information is not found", res)

      const deleted = await Information.destroy({ where: { id } })
      sendResponse(200, "Success delete information", res)
    }
    catch (err) {
      next(err)
    }
  }
};

module.exports = InformationController;