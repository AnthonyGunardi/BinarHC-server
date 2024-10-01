const { Reward_Log, User, Reward, Point, Point_Log } = require('../models/index.js');
const { Op } = require('sequelize');
const { sendResponse, sendData } = require('../helpers/response.js');

class RewardLogController {
  static async getRewardLogs(req, res, next) {
    try {
      const { status } = req.query;
      const options = {
        where: {},
        attributes: {
          exclude : ['reward_id','user_id', 'admin_id']
        },
        include: [
          {
            model: User,
            as: 'Obtained_Reward_Log',
            attributes:['fullname', 'nip' ]
          },
          {
            model: User,
            as: 'Approved_Reward_Log',
            attributes:['fullname', 'nip' ]
          },
          {
            model: Reward,
            attributes:['id', 'title', 'description', 'point', 'photo', 'is_active']
          }
        ]
      };
    
      // if status has a value (!== undefined), include it in the query
      if (status !== undefined)
        options.where.status = status;

      const logs = await Reward_Log.findAll(options);
      sendData(200, logs, "Success get all reward logs", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getRewardLogsByNip(req, res, next) {
    try {
      const nip = req.params.nip;
      const lastID = parseInt(req.query.lastID) || 0;
      const limit = parseInt(req.query.limit) || 0;
      let result = [];

      if (lastID < 1) {
        const logs = await Reward_Log.findAll({
          include: [
            {
              model: User,
              as: 'Obtained_Reward_Log',
              where: { nip },
              attributes:['fullname', 'nip' ]
            },
            {
              model: User,
              as: 'Approved_Reward_Log',
              attributes:['fullname', 'nip' ]
            },
            {
              model: Reward,
              attributes:['title', 'description', 'point', 'photo', 'is_active']
            }
          ],
          limit: limit,
          order: [['id', 'desc']]
        });
        result = logs
      } else {
        const logs = await Reward_Log.findAll({
          where: {
            id: {
              [Op.lt]: lastID
            }
          },
          include: [
            {
              model: User,
              as: 'Obtained_Reward_Log',
              where: { nip },
              attributes:['fullname', 'nip' ]
            },
            {
              model: User,
              as: 'Approved_Reward_Log',
              attributes:['fullname', 'nip' ]
            },
            {
              model: Reward,
              attributes:['title', 'description', 'point', 'photo', 'is_active']
            }
          ],
          limit: limit,
          order: [['id', 'desc']]
        });
        result = logs
      }

      const payload = {
        datas: result,
        lastID: result.length ? result[result.length - 1].id : 0,
        hasMore: result.length >= limit ? true : false
      };
      sendData(200, payload, "Success get all reward logs", res)
    } 
    catch (err) {
        next(err)
    };
  };

  static async getRewardLog(req, res, next) {
    const id = req.params.id
    try {
      const reward_log = await Reward_Log.findOne({
        where: { id },
        attributes: {
          exclude : ['id']
        },
        include: [
          {
            model: User,
            as: 'Obtained_Reward_Log',
            attributes:['fullname', 'nip' ]
          },
          {
            model: User,
            as: 'Approved_Reward_Log',
            attributes:['fullname', 'nip' ]
          },
          {
            model: Reward,
            attributes:['title', 'description']
          }
      ]
      })
      if (!reward_log) return sendResponse(404, "Reward log is not found", res)
      sendData(200, reward_log, "Success get reward log data", res)
    } 
    catch (err) {
      next(err)
    }
  }

  static async update(req, res, next) {
    const id = req.params.id;
    const userEmail = req.user.email;
    const status = req.body.status;
    try {
      const reward_log = await Reward_Log.findOne({
        where: { id }
      })
      if (!reward_log) return sendResponse(404, "Reward log is not found", res)

      //get admin_id
      const user = await User.findOne({ 
        where: { email: userEmail } 
      });
      if (!user) return sendResponse(404, "User is not found", res);

      const updated = await Reward_Log.update({ status, admin_id: user.id }, {
        where: { id },
        returning: true
      })

      //refund user point if status is 'failed'
      if (status === 'failed') {
        //get current point balance
        const currentPoint = await Point.findOne({ where: { user_id: reward_log.user_id } });

        //get reward price
        const reward = await Reward.findOne({
          where: { id: reward_log.reward_id, is_active: true }
        })
        if (!reward) return sendResponse(404, "Reward is not found", res)

        //get updated point balance
        let updatedBalance;
        updatedBalance = parseInt(currentPoint.balance) + parseInt(reward.point);
        
        await Point.update(
          { balance: updatedBalance }, 
          { where: { user_id: currentPoint.user_id } })
        await Point_Log.create(
          { type: "revenue", point: reward.point, description: `Point refund for reward: ${reward.title}`, user_id: reward_log.user_id, admin_id: user.id, last_balance: parseInt(currentPoint.balance) }
        );
      }
      sendResponse(200, "Success update reward log", res)
    }
    catch (err) {
      next(err)
    }
  };
};

module.exports = RewardLogController;