const { Point, Point_Log, User } = require('../models');
const { sendResponse, sendData } = require('../helpers/response.js');

class PointController {
  static async add(req, res, next) {
    try {
      //get admin_id
      const userEmail = req.user.email;
      const user = await User.findOne({ where: { email: userEmail } });
      if (!Boolean(user)) return sendResponse(404, "User is not found", res)

      const pointData = {
        balance: parseInt(req.body.balance),
        user_id: req.body.user_id,
      };
      const logData = {
        type: 'revenue',
        point: req.body.point,
        description: req.body.description,
        user_id: req.body.user_id,
        admin_id: user.id
      };
      //get current point balance
      const currentPoint = await Point.findOne({ where: { user_id: pointData.user_id } });
      if (!Boolean(currentPoint)) return sendResponse(404, "Point data is not found", res)
      
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