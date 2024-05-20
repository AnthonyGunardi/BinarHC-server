const { Office_Address, Office, Address, Indonesia_Village, Indonesia_District, Indonesia_City, Indonesia_Province } = require('../models/index.js');
const { sendResponse, sendData } = require('../helpers/response.js');

class OfficeAddressController {
  static async create(req, res, next) {
    try {
      const slug = req.params.slug;
      const { name, postal_code, meta, is_main, village_id } = req.body;

      //get office_id
      const office = await Office.findOne({ 
        where: { slug } 
      });
      if (!office) return sendResponse(404, "Office is not found", res);

      const address = await Address.create( { name, postal_code, meta, is_main, village_id } );
      const office_address = await Office_Address.create( { office_id: office.id, address_id: address.id } );
      sendData(201, { id: office_address.id, name: address.name }, "Success create office address", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getAddresses(req, res, next) {
    const slug = req.params.slug;
    try {
      //get office_id
      const office = await Office.findOne({ 
        where: { slug } 
      });
      if (!office) return sendResponse(404, 'Office is not found', res);

      const addresses = await Office_Address.findAll({
        where: { office_id: office.id },
        attributes: {
          exclude: ['office_id']
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
      const office_address = await Office_Address.findOne({
        where: { id }
      })
      if (!office_address) return sendResponse(404, "Office address is not found", res)

      const updated = await Address.update(
        { name, postal_code, meta, is_main, village_id }, 
        { where: { id: office_address.address_id }, returning: true }
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
      //Check if office address is exist
      const office_address = await Office_Address.findOne({
        where: { id }
      })
      if (!office_address) return sendResponse(404, "Office address is not found", res)

      const deleted = await Office_Address.destroy({ where: { id } })
      sendResponse(200, "Success delete office address", res)
    }
    catch (err) {
      next(err)
    }
  }
};

module.exports = OfficeAddressController;