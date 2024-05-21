const { Family_Phone, Family, User, Phone } = require('../models/index.js');
const { Op } = require('sequelize');
const { sendResponse, sendData } = require('../helpers/response.js');

class FamilyPhoneController {
  static async create(req, res, next) {
    try {
      const id = req.params.id;
      const { code, phone_number, is_main } = req.body;

      //check if family is exist
      const family = await Family.findOne({ 
        where: { id } 
      });
      if (!family) return sendResponse(404, "Family is not found", res);

      //if is_main is true, set all existing family phones' is_main to false
      if (is_main == 'true') {
        const phones = await Family_Phone.findAll({ 
          where: { family_id: family.id } 
        });
        const phoneIds = phones.map((phone) => phone.phone_id);
        if (phoneIds.length > 0) {
          await Phone.update({ is_main: false }, { where: { id: { [Op.in]: phoneIds }, is_main: true } });
        }
      }

      const phone_data = await Phone.create( { code, phone_number, is_main } );
      const family_phone = await Family_Phone.create( { family_id: family.id, phone_id: phone_data.id } );
      sendData(201, { id: family_phone.id, code: phone_data.code, phone_number: phone_data.phone_number }, "Success create family phone", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getPhones(req, res, next) {
    const id = req.params.id;
    try {
      //check if family is exist
      const family = await Family.findOne({ 
        where: { id } 
      });
      if (!family) return sendResponse(404, 'Family is not found', res);

      const phones = await Family_Phone.findAll({
        where: { family_id: family.id },
        include: {
          model: Phone,
          attributes: {
            exclude: ['id']
          }
        }
      });
      sendData(200, phones, "Success get all family phones", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getPhonesByNip(req, res, next) {
    const nip = req.params.nip;
    try {
      //get user_id
      const user = await User.findOne({ 
        where: { nip } 
      });
      if (!user) return sendResponse(404, "User is not found", res);

      //check if family is exist
      const families = await Family.findAll({ 
        where: { user_id: user.id } 
      });
      if (!families) return sendResponse(404, 'Family is not found', res);
      const familyIds = families.map((family) => family.id);

      const phones = await Family_Phone.findAll({
        where: { family_id: { [Op.in]: familyIds } },
        attributes: {
          exclude: ['family_id']
        },
        include: [
          {
            model: Family,
            attributes: {
              exclude: ['user_id', 'createdAt', 'updatedAt']
            }
          },
          {
            model: Phone,
            attributes: {
              exclude: ['id']
            }
          }
        ]
      });
      sendData(200, phones, "Success get all family phones", res);
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
      const family_phone = await Family_Phone.findOne({
        where: { id }
      })
      if (!family_phone) return sendResponse(404, "Family phone is not found", res)

      //if is_main is true, set all existing family phones' is_main to false
      if (is_main == 'true') {
        const phones = await Family_Phone.findAll({ 
          where: { family_id: family_phone.family_id }
        });
        const phoneIds = phones.map((phone) => phone.phone_id);
        if (phoneIds.length > 0) {
          await Phone.update({ is_main: false }, { where: { id: { [Op.in]: phoneIds }, is_main: true } });
        }
      }

      const updated = await Phone.update(
        { code, phone_number, is_main }, 
        { where: { id: family_phone.phone_id }, returning: true }
      )
      sendResponse(200, "Success update family phone", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async delete(req, res, next) {
    const id = req.params.id
    try {
      //Check if family phone is exist
      const family_phone = await Family_Phone.findOne({
        where: { id }
      })
      if (!family_phone) return sendResponse(404, "Family phone is not found", res)

      const deleted = await Family_Phone.destroy({ where: { id } })
      sendResponse(200, "Success delete family phone", res)
    }
    catch (err) {
      next(err)
    }
  }
};

module.exports = FamilyPhoneController;