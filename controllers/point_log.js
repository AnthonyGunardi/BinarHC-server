const { Point_Log, User } = require('../models/index.js');
const { Op } = require('sequelize');
const { sendResponse, sendData } = require('../helpers/response.js');

class PointLogController {
  static async getPointLogs(req, res, next) {
    try {
      const logs = await Point_Log.findAll({
        attributes: {
          exclude : ['user_id', 'admin_id']
        },
        include: [
          {
            model: User,
            as: 'Obtained_Point_Log',
            attributes:['firstname', 'lastname', 'nip' ]
          },
          {
            model: User,
            as: 'Approved_Point_Log',
            attributes:['firstname', 'lastname', 'nip' ]
          }
        ],
        order: [['updatedAt', 'desc']]
      });
      sendData(200, logs, "Success get all point logs", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getPointLogsByScroll(req, res, next) {
    try {
      const lastID = parseInt(req.query.lastID) || 0;
      const limit = parseInt(req.query.limit) || 0;
      const search = req.query.key || "";
      let result = [];

      if (lastID < 1) {
        const results = await Point_Log.findAll({
          where: {
            [Op.or]: [
              {type: {
                [Op.like]: '%'+search+'%'
              }}, 
              {description:{
                [Op.like]: '%'+search+'%'
              }}
            ]
          },
          attributes: {
            exclude: ['user_id', 'admin_id']
          },
          limit: limit,
          order: [
            ['updatedAt', 'DESC']
          ]
        })
        result = results
      } else {
        const results = await Point_Log.findAll({
          where: {
            id: {
              [Op.lt]: lastID
            },
            [Op.or]: [
              {type: {
                [Op.like]: '%'+search+'%'
              }}, 
              {description: {
                [Op.like]: '%'+search+'%'
              }}
            ]
          },
          attributes: {
            exclude: ['user_id', 'admin_id']
          },
          limit: limit,
          order: [
            ['updatedAt', 'DESC']
          ]
        })
        result = results
      }
      
      const payload = {
        datas: result,
        lastID: result.length ? result[result.length - 1].id : 0,
        hasMore: result.length >= limit ? true : false
      };
      sendData(200, payload, "Success get point logs data", res)
    } 
    catch (err) {
      next(err)
    };
  };

  static async getUserLogsByScroll(req, res, next) {
    try {
      const nip = req.params.nip;
      const lastID = parseInt(req.query.lastID) || 0;
      const limit = parseInt(req.query.limit) || 0;
      const search = req.query.key || "";
      let result = [];

      //get user_id
      const user = await User.findOne({ 
        where: { nip } 
      });
      if (!user) return sendResponse(404, "User is not found", res);

      if (lastID < 1) {
        const results = await Point_Log.findAll({
          where: {
            user_id: user.id,
          },
          attributes: {
            exclude: ['user_id', 'admin_id']
          },
          limit: limit,
          order: [
            ['updatedAt', 'DESC']
          ]
        })
        result = results
      } else {
        const results = await Point_Log.findAll({
          where: {
            id: {
              [Op.lt]: lastID
            },
            user_id: user.id
          },
          attributes: {
            exclude: ['user_id', 'admin_id']
          },
          limit: limit,
          order: [
            ['updatedAt', 'DESC']
          ]
        })
        result = results
      }
      
      const payload = {
        datas: result,
        lastID: result.length ? result[result.length - 1].id : 0,
        hasMore: result.length >= limit ? true : false
      };
      sendData(200, payload, "Success get point logs data", res)
    } 
    catch (err) {
      next(err)
    };
  };
};

module.exports = PointLogController;