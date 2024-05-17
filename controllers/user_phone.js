const { User_Phone, User, Phone } = require('../models/index.js');
const { Op } = require('sequelize');
const { sendResponse, sendData } = require('../helpers/response.js');

class UserPhoneController {
  static async create(req, res, next) {
    try {
      const nip = req.params.nip;
      const { code, phone_number, is_main } = req.body;

      //get user_id
      const user = await User.findOne({ 
        where: { nip } 
      });
      if (!user) return sendResponse(404, "User is not found", res);

      //if is_main is true, set all existing user phones' is_main to false
      if (is_main == 'true') {
        const phones = await User_Phone.findAll({ 
          where: { user_id: user.id } 
        });
        const phoneIds = phones.map((phone) => phone.phone_id);
        if (phoneIds.length > 0) {
          await Phone.update({ is_main: false }, { where: { id: { [Op.in]: phoneIds }, is_main: true } });
        }
      }

      const phone_data = await Phone.create( { code, phone_number, is_main } );
      const user_phone = await User_Phone.create( { user_id: user.id, phone_id: phone_data.id } );
      sendData(201, { id: user_phone.id, code: phone_data.code, phone_number: phone_data.phone_number }, "Success create user phone", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getPhones(req, res, next) {
    const nip = req.params.nip;
    try {
      //get user_id
      const user = await User.findOne({ 
        where: { nip } 
      });
      if (!user) return sendResponse(404, 'User is not found', res);

      const phones = await User_Phone.findAll({
        where: { user_id: user.id },
        attributes: {
          exclude: ['user_id']
        },
        include: {
          model: Phone,
          attributes: {
            exclude: ['id']
          }
        }
      });
      sendData(200, phones, "Success get all user phones", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async update(req, res, next) {
    const id = req.params.id
    const { code, phone_number, is_main } = req.body;
    try {
      //Get phone_id
      const user_phone = await User_Phone.findOne({
        where: { id }
      })
      if (!user_phone) return sendResponse(404, "User phone is not found", res)

      //if is_main is true, set all existing user phones' is_main to false
      if (is_main == 'true') {
        const phones = await User_Phone.findAll({ 
          where: { user_id: user_phone.user_id } 
        });
        const phoneIds = phones.map((phone) => phone.phone_id);
        if (phoneIds.length > 0) {
          await Phone.update({ is_main: false }, { where: { id: { [Op.in]: phoneIds }, is_main: true } });
        }
      }

      const updated = await Phone.update(
        { code, phone_number, is_main }, 
        { where: { id: user_phone.phone_id }, returning: true }
      )
      sendResponse(200, "Success update user phone", res)
    }
    catch (err) {
      next(err)
    }
  };
};

module.exports = UserPhoneController;