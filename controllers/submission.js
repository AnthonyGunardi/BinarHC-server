const { Submission, Mission, User, Point } = require('../models/index.js');
const sharp = require("sharp");
const fs = require('fs')
const path = require('node:path');
const { sendResponse, sendData } = require('../helpers/response.js');

class SubmissionController {
  static async create(req, res, next) {
    let uploadedFilePath = null; // Store file path in case of rollback
    let resizedFilePath = null; // Store resized file path in case of rollback

    try {
      const slug = req.params.slug;
      const { description } = req.body;
      const employee_id = req.user.id;

      // Check if mission slug exists
      const mission = await Mission.findOne({
        where: { slug }
      });
      if (!mission) {
        return sendResponse(404, "Mission is not found", res);
      }

      // Upload file if req.files exists
      let url = null;
      if (req.files) {
        const file = req.files.file;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        url = `submissions/${fileName}`;
        uploadedFilePath = `./public/images/${url}`; // Store uploaded file path
        resizedFilePath = `./public/images/submissions/resized-${fileName}`; // Store resized file path
  
        // Validate file type
        if (!allowedType.includes(ext.toLowerCase())) {
          return sendResponse(422, "File must be an image with extension png, jpg, jpeg", res);
        }  
        // Validate file size (max 5MB)
        if (fileSize > 5000000) {
          return sendResponse(422, "Image must be less than 5 MB", res);
        } 
        // Move file to the server
        await file.mv(uploadedFilePath);

        // Resize & Compress image using Sharp
        await sharp(uploadedFilePath)
          .resize({ height: 1080 }) // Resize while maintaining aspect ratio
          .jpeg({ quality: 70 }) // Compress image
          .toFile(resizedFilePath);
  
        // Delete original file
        await fs.promises.unlink(uploadedFilePath);
      }

      const submission = await Submission.create( { media: url, description, employee_id } );
      sendData(201, { media: submission.media, description: submission.delete, employee_id: submission.employee_id }, "Success create submission", res);  
    }
    catch (err) {
      // Delete uploaded file if it exists
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        await fs.promises.unlink(uploadedFilePath);
      }
      // Delete resized file if it exists
      if (resizedFilePath && fs.existsSync(resizedFilePath)) {
        await fs.promises.unlink(resizedFilePath);
      }

      next(err)
    };
  };

  static async getSubmissionsBySlug(req, res, next) {
    try {
      const slug = req.params.slug;

      //get mission_id
      const mission = await Mission.findOne({ 
        where: { slug } 
      });
      if (!mission) return sendResponse(404, 'Mission is not found', res);

      const submissions = await Submission.findAll({
        where: { mission_id: mission.id },
        include: [
          {
            model: Mission,
            attributes: ['title', 'slug'],
            where: { slug },
          },
          {
            model: Employee,
            attributes: ['fullname', 'nip'],
          }
        ],
        attributes: {
          exclude: ['mission_id', 'employee_id']
        },
        order: [['createdAt', 'desc']]
      });
      sendData(200, submissions, "Success get all submissions", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getSubmission(req, res, next) {
    const id = req.params.id;
    try {
      const submission = await Submission.findOne({
        where: { id },
        include: [
          {
            model: Mission,
            attributes: {
              exclude: ['id']
            }
          },
          {
            model: User,
            as: 'Submitter',
            attributes: ['fullname', 'nip']
          },
          {
            model: User,
            as: 'Grader',
            attributes: ['fullname', 'nip']
          }
        ]
      })
      if (!submission) return sendResponse(404, "Submission is not found", res)
      sendData(200, submission, "Success get submission", res)
    } 
    catch (err) {
      next(err)
    }
  }

  static async updatePoint(req, res, next) {
    let transaction;

    try {
      transaction = await sequelize.transaction();
      const { id } = req.params;
      const { point, note } = req.body;
      const admin_id = req.user.id;

      //check if submission is exist
      const submission = await Submission.findOne({
        where: { id }
      })
      if (!submission) return sendResponse(404, "Submission is not found", res)

      await Submission.update(
        { point, note, admin_id }, 
        { where: { id }, returning: true, transaction }
      )

      //create point & point_log
      //get current point balance
      const currentPoint = await Point.findOne({ where: { user_id: submission.employee_id } });
      if (!Boolean(currentPoint)) return sendResponse(404, "User point data is not found", res)

      //get updated point balance
      let updatedBalance = parseInt(currentPoint.balance) + parseInt(point)

      await Point.update(
        { balance: updatedBalance }, 
        { where: { user_id: currentPoint.user_id }, transaction }
      )
      await Point_Log.create(
        { type, point, description: `Poin dari mission. mission_id: ${submission.mission_id}`, user_id: submission.employee_id, admin_id, last_balance: parseInt(currentPoint.balance) },
        { transaction }
      );

      await transaction.commit();
      sendResponse(200, "Success update submission", res)
    }
    catch (err) {
      // Rollback the transaction in case of an error
      if (transaction) await transaction.rollback();
      next(err)
    }
  };

  static async delete(req, res, next) {
    const id = req.params.id
    try {
      //check if submission is exist
      const submission = await Submission.findOne({
        where: { id }
      })
      if (!submission) return sendResponse(404, "Submission is not found", res)
      
      //delete previous file on server
      if (submission.media !== null) {
        const filePath = `./public/images/${submission.media}`;
        await fs.promises.unlink(filePath);
      }

      await Submission.destroy({ where: { id } })
      sendResponse(200, "Success delete submission", res)
    }
    catch (err) {
      if (err.code === 'ENOENT') {
        await Submission.destroy({ where: { id } })
        sendResponse(200, "Success delete submission", res)
      } else {
        next(err)
      }
    }
  }
};

module.exports = SubmissionController;