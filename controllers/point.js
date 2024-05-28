const { Point, Point_Log, User, Reward, Reward_Log, Post, Event } = require('../models');
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
      const slug = req.params.slug;
      const nip = req.body.nip;

      //get user_id
      const user = await User.findOne({ where: { nip } });
      if (!Boolean(user)) return sendResponse(404, "User is not found", res)

      //check if post is exist
      const post = await Post.findOne({ 
        where: { slug, type: 'event' },
        include: {
          model: Event,
          attributes: {
            exclude: ['post_id']
          }
        }
      });
      if (!Boolean(post)) return sendResponse(404, "Post is not found", res)
      const point = post.Event.point

      //check if point from the event already exist in point_log
      const point_log = await Point_Log.findOne({ 
        where: { type: 'revenue', point, description: `join event ${post.title}`, user_id: user.id, admin_id: post.user_id } 
      })
      if (point_log) return sendResponse(400, "Already attended this event", res)

      //get current point balance
      const currentPoint = await Point.findOne({ where: { user_id: user.id } });
      if (!Boolean(currentPoint)) return sendResponse(404, "Point data is not found", res)
      
      //get updated point balance
      let updatedBalance = parseInt(currentPoint.balance) + parseInt(point)

      await Point.update(
        { balance: updatedBalance }, 
        { where: { user_id: currentPoint.user_id } })
      await Point_Log.create(
        { type: 'revenue', point, description: `join event ${post.title}`, user_id: currentPoint.user_id, admin_id: post.user_id, last_balance: parseInt(currentPoint.balance) }
      );
      sendResponse(200, "Success update point", res)
    }
    catch (err) {
      next(err)
    };
  }

  static async redeem(req, res, next) {
    const id = req.params.id;
    const nip = req.user.nip;
    try {
      //check if reward is exist
      const reward = await Reward.findOne({
        where: { id, is_active: true }
      })
      if (!reward) return sendResponse(404, "Reward is not found", res)

      //get user_id
      const user = await User.findOne({ where: { nip } });
      if (!Boolean(user)) return sendResponse(404, "User is not found", res)

      //get current point balance
      const currentPoint = await Point.findOne({ where: { user_id: user.id } });
      if (!Boolean(currentPoint)) return sendResponse(404, "Point data is not found", res)

      //check if point balance is sufficient to redeem
      if (parseInt(currentPoint.balance) < parseInt(reward.point)) return sendResponse(400, "Insufficient point", res)

      //get updated point balance
      let updatedBalance;
      updatedBalance = parseInt(currentPoint.balance) - parseInt(reward.point);
      
      await Point.update(
        { balance: updatedBalance }, 
        { where: { user_id: currentPoint.user_id } })
      await Point_Log.create(
        { type: "expense", point: reward.point, description: `Redeem reward: ${reward.title}`, user_id: user.id, admin_id: reward.user_id, last_balance: parseInt(currentPoint.balance) }
      );
      await Reward_Log.create(
        { status: "pending", reward_id: reward.id, user_id: user.id, admin_id: reward.user_id }
      );
      sendResponse(200, "Success redeem reward", res)       
    }
    catch (err) {
      next(err)
    }
  }
}

module.exports = PointController;