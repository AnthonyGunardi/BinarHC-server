const { Indonesia_Province } = require('../models/index.js');
const { sendResponse, sendData } = require('../helpers/response.js');

class IndonesiaProvinceController {
  static async getAllProvinces(req, res, next) {
    try {
        const provinces = await Indonesia_Province.findAll({
          attributes:['id', 'name']
        });
        sendData(200, provinces, "Success get all provinces", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getProvince(req, res, next) {
    const id = req.params.id
    try {
        const province = await Indonesia_Province.findOne({
            where: { id },
            attributes:['id', 'name']
        })
        if (!province) return sendResponse(404, "Province is not found", res)
        sendData(200, province, "Success get province data", res)
    } 
    catch (err) {
        next(err)
    }
  }
};

module.exports = IndonesiaProvinceController;