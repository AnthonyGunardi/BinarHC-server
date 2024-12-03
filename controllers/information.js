const { Information } = require('../models/index.js');
const { Op } = require('sequelize');
const fs = require('fs')
const path = require('node:path');
const { sendResponse, sendData } = require('../helpers/response.js');

class InformationController {
  static async create(req, res, next) {
    try {
      const { title, type, description } = req.body;

      //check if information type already exist
      const info = await Information.findOne({ 
        where: { type } 
      });
      if (Boolean(info)) return sendResponse(400, 'Information type already exist', res);

      const newInfo = await Information.create(
        { title, type, description }
      );
      sendData(201, { id: newInfo.id, title: newInfo.title, type: newInfo.type }, "Success create information", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getAllInformations(req, res, next) {
    try {
      const infos = await Information.findAll({
        order: [['id', 'desc']]
      });
      sendData(200, infos, "Success get all informations", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getInformation(req, res, next) {
    const id = req.params.id;
    try {
      const info = await Information.findOne({
        where: { id }
      })
      if (!info) return sendResponse(404, "Information is not found", res)
      sendData(200, info, "Success get information data", res)
    } 
    catch (err) {
      next(err)
    }
  }

  static async getInformationByType(req, res, next) {
    const type = req.params.type
    try {
      const info = await Information.findOne({
        where: { type }
      })
      if (!info) return sendResponse(404, "Information is not found", res)
      sendData(200, info, "Success get information data", res)
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

module.exports = InformationController;