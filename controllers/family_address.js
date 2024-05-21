const { Family_Address, Family, Address, Indonesia_Village, Indonesia_District, Indonesia_City, Indonesia_Province } = require('../models/index.js');
const { Op } = require('sequelize');
const { sendResponse, sendData } = require('../helpers/response.js');

class FamilyAddressController {
  static async create(req, res, next) {
    try {
      const id = req.params.id;
      const { name, postal_code, meta, is_main, village_id } = req.body;

      //check if family  is exist
      const family = await Family.findOne({ 
        where: { id } 
      });
      if (!family) return sendResponse(404, "Family is not found", res);

      //if is_main is true, set all existing family addresses' is_main to false
      if (is_main == 'true') {
        const addresses = await Family_Address.findAll({ 
          where: { family_id: family.id } 
        });
        const addressIds = addresses.map((address) => address.address_id);
        if (addressIds.length > 0) {
          await Address.update({ is_main: false }, { where: { id: { [Op.in]: addressIds }, is_main: true } });
        }
      }

      const address = await Address.create( { name, postal_code, meta, is_main, village_id } );
      const family_address = await Family_Address.create( { family_id: family.id, address_id: address.id } );
      sendData(201, { id: family_address.id, name: address.name }, "Success create family address", res);  
    }
    catch (err) {
      next(err.message)
    };
  };

  static async getAddresses(req, res, next) {
    const id = req.params.id;
    try {
      //check if family is exist
      const family = await Family.findOne({ 
        where: { id } 
      });
      if (!family) return sendResponse(404, 'Family is not found', res);

      const addresses = await Family_Address.findAll({
        where: { family_id: family.id },
        attributes: {
          exclude: ['family_id']
        },
        include: {
          model: Address,
          attributes: {
            exclude: ['village_id']
          },
          include: {
            model: Indonesia_Village,
            attributes: {
              exclude: ['district_id', 'created_at', 'updated_at']
            },
            include: {
              model: Indonesia_District,
              attributes: {
                exclude: ['city_id', 'created_at', 'updated_at']
              },
              include: {
                model: Indonesia_City,
                attributes: {
                  exclude: ['province_id', 'created_at', 'updated_at']
                },
                include: {
                  model: Indonesia_Province,
                  attributes: {
                    exclude: ['created_at', 'updated_at']
                  }
                }
              }
            }
          }
        }
      });
      sendData(200, addresses, "Success get all addresses", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async update(req, res, next) {
    const id = req.params.id
    const { name, postal_code, meta, is_main, village_id } = req.body;
    try {
      //Get address_id
      const family_address = await Family_Address.findOne({
        where: { id }
      })
      if (!family_address) return sendResponse(404, "Family address is not found", res)

      //if is_main is true, set all existing family addresses' is_main to false
      if (is_main == 'true') {
        const addresses = await Family_Address.findAll({ 
          where: { family_id: family_address.family_id } 
        });
        const addressIds = addresses.map((address) => address.address_id);
        if (addressIds.length > 0) {
          await Address.update({ is_main: false }, { where: { id: { [Op.in]: addressIds }, is_main: true } });
        }
      }

      const updated = await Address.update(
        { name, postal_code, meta, is_main, village_id }, 
        { where: { id: family_address.address_id }, returning: true }
      )
      sendResponse(200, "Success update address", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async delete(req, res, next) {
    const id = req.params.id
    try {
      //Check if family address is exist
      const family_address = await Family_Address.findOne({
        where: { id }
      })
      if (!family_address) return sendResponse(404, "Family address is not found", res)

      const deleted = await Family_Address.destroy({ where: { id } })
      sendResponse(200, "Success delete family address", res)
    }
    catch (err) {
      next(err)
    }
  }
};

module.exports = FamilyAddressController;