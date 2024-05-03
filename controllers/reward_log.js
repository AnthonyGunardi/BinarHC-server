const { Reward_Log, User, Reward } = require('../models/index.js');
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
            attributes:['firstname', 'lastname', 'nip' ]
          },
          {
            model: User,
            as: 'Approved_Reward_Log',
            attributes:['firstname', 'lastname', 'nip' ]
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

  static async getRewardLogsByStatus(req, res, next) {
    try {
      const status = req.query.status;
      const logs = await Reward_Log.findAll({
        where: { status },
        include: [
          {
            model: User,
            as: 'Obtained_Reward_Log',
            attributes:['firstname', 'lastname', 'nip' ]
          },
          {
            model: User,
            as: 'Approved_Reward_Log',
            attributes:['firstname', 'lastname', 'nip' ]
          },
          {
            model: Reward,
            attributes:['title', 'description', 'point', 'photo', 'is_active']
          }
        ],
        order: [['id', 'desc']]
      });
      sendData(200, logs, "Success get all reward logs", res);
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
            attributes:['firstname', 'lastname', 'nip' ]
          },
          {
            model: User,
            as: 'Approved_Reward_Log',
            attributes:['firstname', 'lastname', 'nip' ]
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
      sendResponse(200, "Success update reward log", res)
    }
    catch (err) {
      next(err)
    }
  };
};

module.exports = RewardLogController;