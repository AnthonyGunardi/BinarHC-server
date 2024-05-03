const { Point, Point_Log, User } = require('../models');
const { sendResponse, sendData } = require('../helpers/response.js');

class PointController {
  static async modify(req, res, next) {
    try {
      const nip = req.params.nip;
      const { type, point, description } = req.body;
      //get admin_id
      const userEmail = req.user.email;
      const admin = await User.findOne({ where: { email: userEmail } });
      if (!Boolean(admin)) return sendResponse(404, "Admin is not found", res)

      //get user_id
      const user = await User.findOne({ where: { nip } });
      if (!Boolean(user)) return sendResponse(404, "User is not found", res)

      //get current point balance
      const currentPoint = await Point.findOne({ where: { user_id: user.id } });
      if (!Boolean(currentPoint)) return sendResponse(404, "Point data is not found", res)
      
      //get updated point balance
      let updatedBalance;
      if (type == 'revenue') {
        updatedBalance = parseInt(currentPoint.balance) + parseInt(point)
      } else if (type == 'expense') {
        updatedBalance = parseInt(currentPoint.balance) - parseInt(point)
      } else {
        return sendResponse(400, "Point Log type is required", res)
      }

      //check if point balance is smaller than zero
      if (parseInt(updatedBalance) < 0) return sendResponse(400, "Point can't get smaller than zero", res)

      await Point.update(
        { balance: updatedBalance }, 
        { where: { user_id: currentPoint.user_id } })
      await Point_Log.create(
        { type, point, description, user_id: currentPoint.user_id, admin_id: admin.id, last_balance: parseInt(currentPoint.balance) }
      );
      sendResponse(200, "Success update point", res)
    }
    catch (err) {
      next(err)
    };
  }

  static async modifyByJoin(req, res, next) {
    try {
      const nip = req.user.nip;
      const { type, point, description } = req.body;

      //get user_id
      const user = await User.findOne({ where: { nip } });
      if (!Boolean(user)) return sendResponse(404, "User is not found", res)

      //get current point balance
      const currentPoint = await Point.findOne({ where: { user_id: user.id } });
      if (!Boolean(currentPoint)) return sendResponse(404, "Point data is not found", res)
      
      //get updated point balance
      let updatedBalance;
      if (type == 'revenue') {
        updatedBalance = parseInt(currentPoint.balance) + parseInt(point)
      } else if (type == 'expense') {
        updatedBalance = parseInt(currentPoint.balance) - parseInt(point)
      } else {
        return sendResponse(400, "Point Log type is required", res)
      }

      //check if point balance is smaller than zero
      if (parseInt(updatedBalance) < 0) return sendResponse(400, "Point can't get smaller than zero", res)

      await Point.update(
        { balance: updatedBalance }, 
        { where: { user_id: currentPoint.user_id } })
      await Point_Log.create(
        { type, point, description, user_id: currentPoint.user_id, last_balance: parseInt(currentPoint.balance) }
      );
      sendResponse(200, "Success update point", res)
    }
    catch (err) {
      next(err)
    };
  }
}

module.exports = PointController;