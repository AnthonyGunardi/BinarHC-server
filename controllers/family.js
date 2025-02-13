const { Family, User, Family_Address, Family_Phone, Biodata, Office } = require('../models/index.js');
const { Op, Sequelize } = require('sequelize');
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

  static async findBirthdayFamilies(req, res, next) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);
  
    try {
      const users = await User.findAll({
        where: { is_admin: 'employee', is_active: true },
        attributes: ['fullname', 'nip', 'photo', 'is_active'],
        include: [
          {
            model: Biodata,
            as: 'Biodata',
            attributes: ['user_id'],
            include: {
              model: Office,
              attributes: {
                exclude: ['id', 'createdAt', 'updatedAt']
              }
            }
          },
          {
            model: Family,
            as: 'Family',
            attributes: ['fullname', 'birthday', 'status'],
            where: {
              [Op.or]: [
                {
                  [Op.and]: [
                    Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('Family.birthday')), today.getMonth() + 1),
                    Sequelize.where(Sequelize.fn('DAY', Sequelize.col('Family.birthday')), { [Op.gte]: today.getDate() })
                  ]
                },
                {
                  [Op.and]: [
                    Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('Family.birthday')), futureDate.getMonth() + 1),
                    Sequelize.where(Sequelize.fn('DAY', Sequelize.col('Family.birthday')), { [Op.lte]: futureDate.getDate() })
                  ]
                }
              ]
            }
          }
        ],
        order: [['Family', 'birthday', 'desc']]
      });
  
      // Flatten the array to include all family members with birthdays
      const results = users.flatMap(user => {
        const office = user.Biodata?.Office?.name || null;
        
        return user.Family.map(familyMember => ({
          fullname: familyMember.fullname,
          status: familyMember.status,
          birthday: familyMember.birthday,
          employee_name: user.fullname,
          nip: user.nip,
          is_active: user.is_active,
          Office: office
        }));
      });
  
      sendData(200, results, "Success get all birthday families", res);
    } catch (err) {
      next(err);
    }
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