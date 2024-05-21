const { Family, User, Family_Address, Family_Phone } = require('../models/index.js');
const { sendResponse, sendData } = require('../helpers/response.js');

class FamilyController {
  static async create(req, res, next) {
    try {
      const nip = req.params.nip;
      const { fullname, birthday, status } = req.body;

      //get user_id
      const user = await User.findOne({ 
        where: { nip } 
      });
      if (!user) return sendResponse(404, "User is not found", res);

      const family = await Family.create( { fullname, birthday, status, user_id: user.id } );
      sendData(201, { id: family.id, fullname: family.fullname, status: family.status }, "Success create family", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getFamilies(req, res, next) {
    const nip = req.params.nip;
    try {
      //get user_id
      const user = await User.findOne({ 
        where: { nip } 
      });
      if (!user) return sendResponse(404, 'User is not found', res);

      const families = await Family.findAll({
        where: { user_id: user.id },
        attributes: {
          exclude: ['user_id']
        },
        order: [['fullname', 'asc']]
      });
      sendData(200, families, "Success get all families", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async update(req, res, next) {
    const id = req.params.id
    const { fullname, birthday, status } = req.body;
    try {
      //check if family is exist
      const family = await Family.findOne({
        where: { id }
      })
      if (!family) return sendResponse(404, "Family is not found", res)

      const updated = await Family.update(
        { fullname, birthday, status }, 
        { where: { id }, returning: true }
      )
      sendResponse(200, "Success update family", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async delete(req, res, next) {
    const id = req.params.id
    try {
      //Check if family is exist
      const family = await Family.findOne({
        where: { id }
      })
      if (!family) return sendResponse(404, "Family is not found", res)

      const deleted = await Family.destroy({ where: { id } });

      //Check if family address and family phone is exist
      const familyAddresses = await Family_Address.findAll({
        where: { family_id:id }
      });
      const familyPhones = await Family_Phone.findAll({
        where: { family_id:id }
      })
      if (familyAddresses.length > 0) {
        await Family_Address.destroy({ where: { family_id:id } })
      };
      if (familyPhones.length > 0) {
        await Family_Phone.destroy({ where: { family_id:id } })
      };

      sendResponse(200, "Success delete family", res)
    }
    catch (err) {
      next(err)
    }
  }
};

module.exports = FamilyController;