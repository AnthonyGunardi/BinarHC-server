const { Master_Data, User } = require('../models/index.js');
const { Op } = require('sequelize');
const fs = require('fs')
const path = require('node:path');
const { sendResponse, sendData } = require('../helpers/response.js');

class MasterDataController {
  static async getAllMasterData(req, res, next) {
    try {
      const master_data = await Master_Data.findAll();
      sendData(200, master_data, "Success get all master data", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async update(req, res, next) {
    const id = req.params.id
    const userEmail = req.user.email
    const { annual_leave } = req.body;
    try {
      //check if master data is exist
      const master_data = await Master_Data.findOne({
        where: { id }
      })
      if (!master_data) return sendResponse(404, "Master Data is not found", res)

      const updatedData = await Master_Data.update(
        { annual_leave }, 
        { where: { id: master_data.id }, returning: true }
      )
      sendResponse(200, "Success update Master Data", res)
    }
    catch (err) {
      next(err)
    }
  };
};

module.exports = MasterDataController;