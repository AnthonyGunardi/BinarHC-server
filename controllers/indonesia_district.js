const { Indonesia_District } = require('../models/index.js');
const { sendResponse, sendData } = require('../helpers/response.js');

class IndonesiaDistrictController {
  static async getDistrictsByCity(req, res, next) {
    try {
      const city_id = req.query.city_id
      if (!city_id) return sendResponse(422, "Missing the required parameter", res)
      const city_districts = await Indonesia_District.findAll({
        where: { city_id },
        attributes:['id', 'name']
      });
      if (city_districts.length == 0) return sendResponse(404, "District not found", res)
      sendData(200, city_districts, "Success get districts", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getDistrict(req, res, next) {
    const id = req.params.id
    try {
        const district = await Indonesia_District.findOne({
            where: { id },
            attributes:['id', 'name']
        })
        if (!district) return sendResponse(404, "District is not found", res)
        sendData(200, district, "Success get district data", res)
    } 
    catch (err) {
        next(err)
    }
  }
};

module.exports = IndonesiaDistrictController;