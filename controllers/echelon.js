const { Echelon, Biodata } = require('../models');
const { sendResponse, sendData } = require('../helpers/response.js');
const { Op } = require('sequelize');

class EchelonController {
  static async create(req, res, next) {
    const echelonData = {
      title: req.body.title, 
      code: req.body.code,
      description: req.body.description
    };
    try {
      const echelon = await Echelon.findOne({ 
        where: { 
          code: echelonData.code
        } 
      });
      if (!Boolean(echelon)) {
        const newEchelon = await Echelon.create(echelonData);
        const { title, code, description } = newEchelon;
        sendData(201, { title, code, description }, "Success create echelon", res);  
      } else {
        sendResponse(400, 'Echelon already exist', res);
      }
    }
    catch (err) {
      next(err)
    };
  };

  static async getAllEchelons(req, res, next) {
    try {
        const echelons = await Echelon.findAll({
          attributes:['title', 'code', 'description'],
          order: [['code', 'asc']]
        });
        sendData(200, echelons, "Success get all echelons", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getEchelon(req, res, next) {
    const code = req.params.code
    try {
        const echelon = await Echelon.findOne({
            where: { code },
            attributes:['title', 'code', 'description']
        })
        if (!echelon) return sendResponse(404, "Echelon is not found", res)
        sendData(200, office, "Success get echelon data", res)
    } 
    catch (err) {
        next(err)
    }
  }

  static async update(req, res, next) {
    const currentCode = req.params.code
    const echelonData = {
      title: req.body.title,
      code: req.body.code,
      description: req.body.description
    };
    try {
      const echelon = await Echelon.findOne({
        where: { code: currentCode }
      })
      if (!echelon) return sendResponse(404, "Echelon is not found", res)
      const echelonWithNewCode = await Echelon.findOne({
        where: { 
          [Op.and]: [
            { 
              id: {
                [Op.ne]: echelon.id, 
              } 
            },
            { code: echelonData.code }
        ]
          }
      })
      if (echelonWithNewCode) return sendResponse(403, "Code is already used", res)
      const updated = await Echelon.update(echelonData, {
        where: { id: echelon.id },
        returning: true
      })
      sendResponse(200, "Success update echelon", res)
    }
    catch (err) {
      next(err)
    }
  };
};

module.exports = EchelonController;