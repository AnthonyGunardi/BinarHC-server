const { Office_Phone, Office, Phone } = require('../models/index.js');
const { Op } = require('sequelize');
const { sendResponse, sendData } = require('../helpers/response.js');

class OfficePhoneController {
  static async create(req, res, next) {
    try {
      const slug = req.params.slug;
      const { code, phone_number, is_main } = req.body;

      //get office_id
      const office = await Office.findOne({ 
        where: { slug } 
      });
      if (!office) return sendResponse(404, "Office is not found", res);

      //if is_main is true, set all existing office phones' is_main to false
      if (is_main == 'true') {
        const phones = await Office_Phone.findAll({ 
          where: { office_id: office.id } 
        });
        const phoneIds = phones.map((phone) => phone.phone_id);
        if (phoneIds.length > 0) {
          await Phone.update({ is_main: false }, { where: { id: { [Op.in]: phoneIds }, is_main: true } });
        }
      }

      const phone_data = await Phone.create( { code, phone_number, is_main } );
      const office_phone = await Office_Phone.create( { office_id: office.id, phone_id: phone_data.id } );
      sendData(201, { id: office_phone.id, code: phone_data.code, phone_number: phone_data.phone_number }, "Success create office phone", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getPhones(req, res, next) {
    const slug = req.params.slug;
    try {
      //get office_id
      const office = await Office.findOne({ 
        where: { slug } 
      });
      if (!office) return sendResponse(404, 'Office is not found', res);

      const phones = await Office_Phone.findAll({
        where: { office_id: office.id },
        attributes: {
          exclude: ['office_id']
        },
        include: {
          model: Phone,
          attributes: {
            exclude: ['id']
          }
        }
      });
      sendData(200, phones, "Success get all office phones", res);
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
      const office_phone = await Office_Phone.findOne({
        where: { id }
      })
      if (!office_phone) return sendResponse(404, "Office phone is not found", res)

      //if is_main is true, set all existing office phones' is_main to false
      if (is_main == 'true') {
        const phones = await Office_Phone.findAll({ 
          where: { office_id: office_phone.office_id } 
        });
        const phoneIds = phones.map((phone) => phone.phone_id);
        if (phoneIds.length > 0) {
          await Phone.update({ is_main: false }, { where: { id: { [Op.in]: phoneIds }, is_main: true } });
        }
      }

      const updated = await Phone.update(
        { code, phone_number, is_main }, 
        { where: { id: office_phone.phone_id }, returning: true }
      )
      sendResponse(200, "Success update office phone", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async delete(req, res, next) {
    const id = req.params.id
    try {
      //Check if office phone is exist
      const office_phone = await Office_Phone.findOne({
        where: { id }
      })
      if (!office_phone) return sendResponse(404, "Office phone is not found", res)

      const deleted = await Office_Phone.destroy({ where: { id } })
      sendResponse(200, "Success delete office phone", res)
    }
    catch (err) {
      next(err)
    }
  }
};

module.exports = OfficePhoneController;