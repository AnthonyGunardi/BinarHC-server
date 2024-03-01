const { Indonesia_City } = require('../models/index.js');
const { sendResponse, sendData } = require('../helpers/response.js');

class IndonesiaCityController {
  static async getCitiesByProvince(req, res, next) {
    const province_id = req.query.province_id
    try {
      if (!province_id) return sendResponse(422, "Missing the required parameter", res)
      const province_cities = await Indonesia_City.findAll({
        where: { province_id },
        attributes:['id', 'name']
      });
      if (province_cities.length == 0) return sendResponse(404, "City not found", res)
      sendData(200, province_cities, "Success get cities", res);
    } 
    catch (err) {
      next(err)
    };
  };

  static async getCity(req, res, next) {
    const id = req.params.id
    try {
        const city = await Indonesia_City.findOne({
            where: { id },
            attributes:['id', 'name']
        })
        if (!city) return sendResponse(404, "City is not found", res)
        sendData(200, city, "Success get city data", res)
    } 
    catch (err) {
        next(err)
    }
  }
};

module.exports = IndonesiaCityController;