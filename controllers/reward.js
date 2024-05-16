const { Reward, User } = require('../models/index.js');
const { Op } = require('sequelize');
const fs = require('fs')
const path = require('node:path');
const { sendResponse, sendData } = require('../helpers/response.js');

class RewardController {
  static async create(req, res, next) {
    try {
      const userEmail = req.user.email
      const { email, title, description, point, published_at, expired_at, is_active } = req.body;

      //check if user is exist and is login
      const user = await User.findOne({ 
        where: { email } 
      });
      if (!user || user.email != userEmail) return sendResponse(404, "User is not found", res);

      //check if reward title already exist
      const reward = await Reward.findOne({ 
        where: { title } 
      });
      if (Boolean(reward)) return sendResponse(400, 'Reward already exist', res);

      //upload file if req.files isn't null
      let url = null
      if (req.files !== null) {
        const file = req.files.photo;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        url = `reward-photos/${fileName}`;

        //validate file type
        if(!allowedType.includes(ext.toLocaleLowerCase())) return sendResponse(422, "File must be image with extension png, jpg, jpeg", res)    
        //validate file size max 5mb
        if(fileSize > 5000000) return sendResponse(422, "Image must be less than 5 mb", res)
        //place the file on server
        file.mv(`./public/images/reward-photos/${fileName}`, async (err) => {
          if(err) return sendResponse(502, err.message, res)
        })
      }

      const newReward = await Reward.create(
        { email, title, description, point, photo: url, published_at, expired_at, user_id: user.id, is_active }
      );
      sendData(201, { id: newReward.id, name: newReward.name, description: newReward.description, point: newReward.point }, "Success create reward", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getAllRewards(req, res, next) {
    try {
      const rewards = await Reward.findAll({
        include: {
          model: User,
          as: 'Author',
          attributes: ['firstname', 'lastname' , 'email']
        },
        order: [['title', 'asc']]
      });
      sendData(200, rewards, "Success get all rewards", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getRewardsByScroll(req, res, next) {
    try {
      const lastID = parseInt(req.query.lastID) || 0;
      const limit = parseInt(req.query.limit) || 0;
      const search = req.query.key || "";
      const today = new Date();
      let result = [];

      if (lastID < 1) {
        const results = await Reward.findAll({
          where: {
            [Op.or]: [
              {title: {
                [Op.like]: '%'+search+'%'
              }}, 
              {description:{
                [Op.like]: '%'+search+'%'
              }}
            ],
            published_at: {
              [Op.lte]: today
            },
            expired_at: {
              [Op.gt]: today
            },
            is_active: true
          },
          attributes: {
            exclude: ['user_id']
          },
          limit: limit,
          order: [
            ['id', 'DESC']
          ]
        })
        result = results
      } else {
        const results = await Reward.findAll({
          where: {
            id: {
              [Op.lt]: lastID
            },
            [Op.or]: [
              {title: {
                [Op.like]: '%'+search+'%'
              }}, 
              {description: {
                [Op.like]: '%'+search+'%'
              }}
            ],
            published_at: {
              [Op.lte]: today
            },
            expired_at: {
              [Op.gt]: today
            },
            is_active: true
          },
          attributes: {
            exclude: ['user_id']
          },
          limit: limit,
          order: [
            ['published_at', 'DESC']
          ]
        })
        result = results
      }
      
      const payload = {
        datas: result,
        lastID: result.length ? result[result.length - 1].id : 0,
        hasMore: result.length >= limit ? true : false
      };
      sendData(200, payload, "Success get rewards data", res)
    } 
    catch (err) {
      next(err)
    };
  };

  static async getReward(req, res, next) {
    const id = req.params.id
    try {
      const reward = await Reward.findOne({
        where: { id },
        attributes:['title', 'description', 'point', 'photo', 'published_at', 'expired_at', 'user_id', 'is_active']
      })
      if (!reward) return sendResponse(404, "Reward is not found", res)
      sendData(200, reward, "Success get reward data", res)
    } 
    catch (err) {
      next(err)
    }
  }

  static async toggleReward(req, res, next) {
    const id = req.params.id
    let rewardData = {
      is_active: false
    };
    try {
      const reward = await Reward.findOne({
        where: { id }
      })
      if (!reward) return sendResponse(404, "Reward is not found", res)
      if (reward.is_active == false) {
        rewardData.is_active = true
      }
      const updated = await Reward.update(rewardData, {
        where: { id },
        returning: true
      })
      sendResponse(200, "Success update reward", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async update(req, res, next) {
    const id = req.params.id
    const userEmail = req.user.email
    const { email, title, description, point, published_at, expired_at, is_active } = req.body;
    try {
      //check if user is exist and is login
      const user = await User.findOne({ 
        where: { email } 
      });
      if (!user || user.email != userEmail) return sendResponse(404, "User is not found", res);

      //check if reward is exist
      const reward = await Reward.findOne({
        where: { id }
      })
      if (!reward) return sendResponse(404, "Reward is not found", res)

      //upload file if req.files isn't null
      let url;
      if(!req.files) {
        url = reward.photo;
      } else {
        const file = req.files.photo;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        url = `reward-photos/${fileName}`;
    
        //validate file type
        if(!allowedType.includes(ext.toLocaleLowerCase())) return sendResponse(422, "File must be image with extension png, jpg, jpeg", res)
        //validate file size max 5mb
        if(fileSize > 5000000) return sendResponse(422, "Image must be less than 5 mb", res)
        //place the file on server
        file.mv(`./public/images/reward-photos/${fileName}`, async (err) => {
          if(err) return sendResponse(502, err.message, res)
        })
        //delete previous file on server
        if (reward.photo !== null) {
          const filePath = `./public/images/${reward.photo}`;
          fs.unlinkSync(filePath);
        }
      }

      //check if new post title is already used
      const rewardWithNewTitle = await Reward.findOne({
        where: { 
          [Op.and]: [
            { 
              id: {
                [Op.ne]: id, 
              } 
            },
            { title: reward.title }
          ]
        }
      })
      if (rewardWithNewTitle) return sendResponse(403, "Title already used", res)

      const updatedReward = await Reward.update(
        { email, title, description, point, photo: url, published_at, expired_at, user_id: user.id, is_active }, 
        { where: { id: reward.id }, returning: true }
      )
      sendResponse(200, "Success update reward", res)
    }
    catch (err) {
      next(err)
    }
  };
};

module.exports = RewardController;