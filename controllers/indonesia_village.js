const { Indonesia_Village } = require('../models/index.js');
const { sendResponse, sendData } = require('../helpers/response.js');

class IndonesiaVillageController {
  static async getVillagesByDistrict(req, res, next) {
    try {
      const district_id = req.query.district_id
      if (!district_id) return sendResponse(422, "Missing the required parameter", res)
      const district_villages = await Indonesia_Village.findAll({
        where: { district_id },
        attributes:['id', 'name']
      });
      if (district_villages.length == 0) return sendResponse(404, "Village not found", res)
      sendData(200, district_villages, "Success get villages", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getVillage(req, res, next) {
    const id = req.params.id
    try {
        const village = await Indonesia_Village.findOne({
            where: { id },
            attributes:['id', 'name']
        })
        if (!village) return sendResponse(404, "Village is not found", res)
        sendData(200, village, "Success get village data", res)
    } 
    catch (err) {
        next(err)
    }
  }
};

module.exports = IndonesiaVillageController;