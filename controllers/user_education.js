const { User_Education, User, Education } = require('../models/index.js');
const { Op } = require('sequelize');
const { sendResponse, sendData } = require('../helpers/response.js');

class UserEducationController {
  static async create(req, res, next) {
    try {
      const { user_id, education_id, certificate, is_graduate} = req.body;

      //check if user education is already exist
      const userEducation = await User_Education.findOne({ 
        where: { user_id, education_id } 
      });
      if (userEducation) return sendResponse(400, "User Education already exist", res);

      //check if user_id is valid and active
      const user = await User.findOne({ where: { id: user_id, is_active: true } });
      if (!user) return sendResponse(404, "User not found", res);

      //check if education_id is valid and active
      const education = await Education.findOne({ where: { id: education_id, is_active: true } });
      if (!education) return sendResponse(404, "Education not found or inactive", res);

      const new_education = await User_Education.create( { user_id, education_id, certificate, is_graduate } );
      sendData(201, { id: new_education.id, user_id: new_education.user_id, education_id: new_education.education_id }, "Success create User Education", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getUserEducations(req, res, next) {
    try {
      const { id } = req.params;
      const userEducation = await User_Education.findAll({ 
        where: { user_id: id },
        attributes: {
          exclude: ['user_id', 'education_id']
        },
        include: [
          {
            model: Education,
            attributes: {
              exclude: ['createdAt', 'updatedAt']
            }
          }
        ]
      });
      if (!userEducation) return sendResponse(404, "User Education not found", res);
      sendData(200, userEducation, "Success get User Education", res);
    }
    catch (err) {
      next(err)
    };
  };

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { user_id, education_id } = req.body;

      //check if User Education is already exist
      const userEducation = await User_Education.findOne({ 
        where: { id } 
      });
      if (!userEducation) return sendResponse(404, "User Education not found", res);

      //check if user_id is valid and active
      const user = await User.findOne({ where: { id: user_id, is_active: true } });
      if (!user) return sendResponse(404, "User not found", res);

      //check if education_id is valid and active
      const education = await Education.findOne({ where: { id: education_id, is_active: true } });
      if (!education) return sendResponse(404, "Education not found or inactive", res);

      const updateData = { ...req.body }; //creates a new object with all the same key-value pairs as req.body

      await User_Education.update( updateData, { where: { id } } );
      sendResponse(200, "Success update User Education", res);
    }
    catch (err) {
      next(err)
    };
  }

};

module.exports = UserEducationController;

