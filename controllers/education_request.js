const { Education_Request, Education, User_Education, User } = require('../models/index.js');
const Sequelize = require('sequelize');
let sequelize;
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}
const { sendResponse, sendData } = require('../helpers/response.js');

class EducationRequestController {
  static async create(req, res, next) {
    try {
      const { user_id, education_id } = req.body;

      //check if education_id is valid and active
      const education = await Education.findOne({ where: { id: education_id, is_active: true } });
      if (!education) return sendResponse(404, "Education not found or inactive", res);

      //check if user education is already exist
      const userEducation = await User_Education.findOne({ where: { user_id, education_id } });
      if (userEducation) return sendResponse(400, "User Education already exist", res);

      //check if pending Education_Request is already exist
      const Education_Request_exist = await Education_Request.findOne({ where: { status: "pending", education_id, user_id } });
      if (Education_Request_exist) return sendResponse(400, "education request is already exist", res);

      const education_request = await Education_Request.create( { status: "pending", user_id, education_id } );
      sendData(201, { id: education_request.id, status: education_request.status, user_id: education_request.user_id }, "Success create education request", res);  
    }
    catch (err) {
      next(err)
    };
  };

  static async getAllPendingRequests(req, res, next) {
    try {
      const requests = await Education_Request.findAll({ 
        where: { status: "pending" },
        include: [
          {
            model: User,
            attributes: ['fullname', 'nip']
          },
          {
            model: Education,
            attributes: ['title']
          }
        ],
        order: [['id', 'asc']]
      });
    
      const result = requests.map((request) => {
        return {
          id: request.id,
          status: request.status,
          education_id: request.education_id,
          education_title: request.Education ? request.Education.title : null,
          user_id: request.user_id,
          user_fullname: request.user ? request.User.fullname : null,
          user_nip: request.user ? request.User.nip : null,
          createdAt: request.createdAt
        }
      })

      sendData(200, result, "Success get all pending education requests", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async update(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
      const id = req.params.id
      const { status } = req.body;
      const admin_id = req.user.id;

      //Check if request is exist
      const education_request = await Education_Request.findOne({
        where: { id }
      })
      if (!Education_Request) return sendResponse(404, "education request is not found", res)

      //check if user education is already exist
      const user = await User.findOne({ 
        where: { id: education_request.user_id, is_active: true },
        include: {
          model: User_Education,
          attributes: ['education_id']
        }
      });
      if (!user) return sendResponse(404, "User is not found", res);

      if (status == 'reject') {
        await Education_Request.update(
          { status, admin_id }, 
          { where: { id: education_request.id }, returning: true, transaction }
        )
      }

      if (status == 'success') {
        await Education_Request.update(
          { status, admin_id }, 
          { where: { id: education_request.id }, returning: true, transaction }
        )
        // create user education
        await User_Education.create(
          { user_id: education_request.user_id, education_id: education_request.education_id, is_graduate: false }, 
          { returning: true, transaction }
        )
        
      }

      await transaction.commit();
      sendResponse(200, "Success update education request", res)
    }
    catch (err) {
      if (transaction) await transaction.rollback();
      next(err)
    }
  };
};

module.exports = EducationRequestController;