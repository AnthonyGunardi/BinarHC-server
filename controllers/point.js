const { Point, Point_Log } = require('../models');
const { sendResponse, sendData } = require('../helpers/response.js');

class PointController {
  static async add(req, res, next) {
    try {
      const pointData = {
        balance: parseInt(req.body.balance),
        user_id: req.body.user_id,
      }
      const logData = {
        type: 'revenue',
        point: req.body.point,
        description: req.body.description,
        user_id: req.body.user_id, //to do: get from db, based on nip
        admin_id: req.body.admin_id //to do: get from db, based from nip
      }
      const currentPoint = await Point.findOne({ where: { user_id: pointData.user_id } })
      if (!Boolean(poinByUser)) return sendResponse(404, "Point data is not found", res)
      await Point.update(
        { balance: (parseInt(currentPoint.balance) + parseInt(pointData.balance)) }, 
        { where: { user_id: pointData.user_id } })
      await Point_Log.create(logData);
      res.status(201).json({ message: 'Point has been updated'});
    }
    catch (err) {
      next(err)
    };
  }
}

module.exports = PointController;