const { Point, Point_Log, User } = require('../models');
const { sendResponse, sendData } = require('../helpers/response.js');

class PointController {
  static async modify(req, res, next) {
    try {
      const user_id = req.params.id;
      const { inputPoint, type, point, description } = req.body;
      //get admin_id
      const userEmail = req.user.email;
      const user = await User.findOne({ where: { email: userEmail } });
      if (!Boolean(user)) return sendResponse(404, "User is not found", res)

      const pointData = {
        balance: parseInt(req.body.balance),
        user_id: req.params.id,
      };

      //get current point balance
      const currentPoint = await Point.findOne({ where: { user_id } });
      if (!Boolean(currentPoint)) return sendResponse(404, "Point data is not found", res)
      
      //get updated point balance
      let updatedBalance;
      if (type == 'revenue') {
        updatedBalance = parseInt(currentPoint.balance) + parseInt(inputPoint)
      } else if (type == 'expense') {
        updatedBalance = parseInt(currentPoint.balance) - parseInt(inputPoint)
      } else {
        return sendResponse(400, "Point Log type is required", res)
      }

      await Point.update(
        { balance: updatedBalance }, 
        { where: { user_id } })
      await Point_Log.create({ type, point, description, user_id, admin_id: user.id });
      sendResponse(200, "Success update point", res)
    }
    catch (err) {
      next(err)
    };
  }
}

module.exports = PointController;