const { User_Address, User, Address, Indonesia_Village, Indonesia_District, Indonesia_City, Indonesia_Province } = require('../models/index.js');
const { Op } = require('sequelize');
const { sendResponse, sendData } = require('../helpers/response.js');

class UserAddressController {
  static async create(req, res, next) {
    try {
      const nip = req.params.nip;
      const { name, postal_code, meta, is_main, village_id } = req.body;

      //get user_id
      const user = await User.findOne({ 
        where: { nip } 
      });
      if (!user) return sendResponse(404, "User is not found", res);

      //if is_main is true, set all existing user addresses' is_main to false
      if (is_main == 'true') {
        const addresses = await User_Address.findAll({ 
          where: { user_id: user.id } 
        });
        const addressIds = addresses.map((address) => address.address_id);
        if (addressIds.length > 0) {
          await Address.update({ is_main: false }, { where: { id: { [Op.in]: addressIds }, is_main: true } });
        }
      }

      const address = await Address.create( { name, postal_code, meta, is_main, village_id } );
      const user_address = await User_Address.create( { user_id: user.id, address_id: address.id } );
      sendData(201, { id: user_address.id, name: address.name }, "Success create user address", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getAddresses(req, res, next) {
    const nip = req.params.nip;
    try {
      //get user_id
      const user = await User.findOne({ 
        where: { nip } 
      });
      if (!user) return sendResponse(404, 'User is not found', res);

      const addresses = await User_Address.findAll({
        where: { user_id: user.id },
        attributes: {
          exclude: ['user_id']
        },
        include: {
          model: Address,
          attributes: {
            exclude: ['id', 'village_id']
          },
          include: {
            model: Indonesia_Village,
            attributes: {
              exclude: ['id', 'district_id', 'created_at', 'updated_at']
            },
            include: {
              model: Indonesia_District,
              attributes: {
                exclude: ['id', 'city_id', 'created_at', 'updated_at']
              },
              include: {
                model: Indonesia_City,
                attributes: {
                  exclude: ['id', 'province_id', 'created_at', 'updated_at']
                },
                include: {
                  model: Indonesia_Province,
                  attributes: {
                    exclude: ['id', 'created_at', 'updated_at']
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
      const user_address = await User_Address.findOne({
        where: { id }
      })
      if (!user_address) return sendResponse(404, "User address is not found", res)

      //if is_main is true, set all existing user addresses' is_main to false
      if (is_main == 'true') {
        const addresses = await User_Address.findAll({ 
          where: { user_id: user_address.user_id } 
        });
        const addressIds = addresses.map((address) => address.address_id);
        if (addressIds.length > 0) {
          await Address.update({ is_main: false }, { where: { id: { [Op.in]: addressIds }, is_main: true } });
        }
      }

      const updated = await Address.update(
        { name, postal_code, meta, is_main, village_id }, 
        { where: { id: user_address.address_id }, returning: true }
      )
      sendResponse(200, "Success update address", res)
    }
    catch (err) {
      next(err)
    }
  };
};

module.exports = UserAddressController;