const { Attendance, User, Biodata, Office, Office_Address, Address, Echelon, Absence, Overtime } = require('../models/index.js');
const { Op } = require('sequelize');
const moment = require('moment-timezone');
const fs = require('fs')
const path = require('node:path');
const { sendResponse, sendData } = require('../helpers/response.js');
const { calculateDistance } = require('../helpers/calculateDistance');

class AttendanceController {
  static async clockIn(req, res, next) {
    try {
      const userEmail = req.user.email
      const { date, clock_in, status, photo, meta, note } = req.body;

      // Parse and format the date for UTC+7 timezone
      const parsedDate = moment(date).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss");

      //check if user is exist and is login
      const user = await User.findOne({ 
        where: { email: userEmail },
        include: [
          {
            model: Biodata,
            as: 'Biodata',
            attributes:[ 'id' ],
            include: {
              model: Office,
              attributes: [ 'name', 'slug'],
              include: {
                model: Office_Address,
                attributes: [ 'id'],
                include: {
                  model: Address,
                  attributes: [ 'name', 'postal_code', 'meta' ]
                }
              }
            }
          }
        ]
      });
      if (!user) return sendResponse(404, "User is not found", res);

      //check if user already have registered an approved absence
      const absence = await Absence.findOne({ 
        where: {
          start_date: {
            [Op.lte]: parsedDate, // start_date should be less than or equal to checkin day
          },
          end_date: {
            [Op.gte]: parsedDate, // end_date should be greater than or equal to checkin day
          },
          employee_id: user.id, 
          status: 'success' 
        } 
      });
      if (Boolean(absence)) return sendResponse(400, 'Anda sedang dalam ijin tidak bekerja', res);

      //check if attendance already exist
      const attendance = await Attendance.findOne({ 
        where: { date, user_id: user.id } 
      });
      if (Boolean(attendance)) return sendResponse(400, 'Anda sudah melakukan absen', res);

      if (status == 'WFO') {
        // Extract the office's meta from the nested user structure
        const officeMeta = user.Biodata?.Office?.Office_Addresses?.[0]?.Address?.meta;
        if (!officeMeta) return sendResponse(400, 'Office location not found', res);

        // Parse office's latitude and longitude
        const [officeLat, officeLon] = officeMeta.split(',').map(Number);

        // Parse the user's latitude and longitude
        const [userLat, userLon] = meta.split(',').map(Number);

        // Calculate the distance between user and office
        // const distance = calculateDistance(userLat, userLon, officeLat, officeLon);
        // if (distance > 500) {
        //   return sendResponse(400, 'Anda berada di luar kantor', res);
        // }
      } else {
        //check if user already have registered an approved overtime
        const overtime = await Overtime.findOne({ 
          where: {
            start_time: {
              [Op.lte]: parsedDate, // start_date should be less than or equal to checkin day
            },
            end_time: {
              [Op.gte]: parsedDate, // end_date should be greater than or equal to checkin day
            },
            type: 'WFA',
            employee_id: user.id, 
            status: 'success' 
          } 
        });
        if (!Boolean(overtime)) return sendResponse(400, 'Anda belum mendapatkan ijin untuk WFA', res);
      }

      //upload file if req.files isn't null
      let url = null
      if (req.files != null) {
        const file = req.files.photo;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        const fileName = file.md5 + ext;
        const allowedType = ['.png', '.jpg', '.jpeg'];
        url = `attendances/${fileName}`;

        //validate file type
        if(!allowedType.includes(ext.toLocaleLowerCase())) return sendResponse(422, "File must be image with extension png, jpg, jpeg", res)    
        //validate file size max 5mb
        if(fileSize > 5000000) return sendResponse(422, "Image must be less than 5 mb", res)
        //place the file on server
        file.mv(`./public/images/attendances/${fileName}`, async (err) => {
          if(err) return sendResponse(502, err.message, res)
        })
      }

      const newAttendance = await Attendance.create(
        { date, is_present: true, clock_in, status, photo, meta, note, user_id: user.id }
      );
      sendData(201, { id: newAttendance.id, date: newAttendance.date, clock_in: newAttendance.clock_in, status: newAttendance.status, meta: newAttendance.meta, user_id: newAttendance.user_id }, "Absen masuk berhasil", res);  
    }
    catch (err) {
      next(err.message)
    };
  };

  static async clockOut(req, res, next) {
    const nip = req.params.nip;
    const userEmail = req.user.email;
    const { clock_out } = req.body;
    const today = new Date().toISOString().slice(0, 10);
    try {
      //get user_id
      const user = await User.findOne({ 
        where: { nip, email: userEmail } 
      });
      if (!user) return sendResponse(404, "User is not found", res);

      //check if attendance is exist
      const attendance = await Attendance.findOne({
        where: { user_id: user.id, date: today },
      })
      if (!attendance) return sendResponse(404, "Anda belum absensi masuk", res)
      if (attendance.clock_out) return sendResponse(400, "Anda sudah absen pulang", res)

      const updatedAttendance = await Attendance.update(
        { clock_out }, 
        { where: { 
            date: today, 
            user_id: user.id 
          }, 
          returning: true 
        }
      )
      sendResponse(200, "Absen pulang berhasil", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async getAllAbsences(req, res, next) {
    try {
      const { division_slug, start_date, end_date } = req.query;
      const absences = await Absence.findAll({
        where: {
          start_date: {
            [Op.gte]: start_date,
            [Op.lte]: end_date  
          }
        },
        attributes: {
          exclude: ['employee_id', 'admin_id']
        },
        include: [
          {
            model: User,
            as: 'Absence_Requester',
            attributes: {
              exclude: ['createdAt', 'updatedAt']
            },
            required: true,
            include: [
              {
                model: Biodata,
                as: 'Biodata',
                required: true,
                attributes: {
                  exclude: [
                    'id', 
                    'birthday', 
                    'hometown', 
                    'hire_date', 
                    'religion', 
                    'gender', 
                    'last_education', 
                    'marital_status',
                    'user_id',
                    'createdAt', 
                    'updatedAt'
                  ]
                },
                include: [
                  {
                    model: Echelon,
                    required: false,
                    attributes: ['title']
                  },
                  {
                    model: Office,
                    as: 'Office',
                    where: division_slug ? { slug: division_slug } : {}, // Apply filter only if division_slug is provided
                    required: !!division_slug, // If division_slug is provided, make it required
                    attributes: ['name']
                  }
                ]
              }
            ]
          },
          {
            model: User,
            as: 'Absence_Approver',
            attributes: {
              exclude: ['id', 'email', 'password', 'id_card', 'createdAt', 'updatedAt']
            }
          },
        ],
        order: [['id', 'ASC']]
      });
      sendData(200, absences, "Success get all absences", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getUserAttendancesByScroll(req, res, next) {
    try {
      const lastID = parseInt(req.query.lastID) || 0;
      const limit = parseInt(req.query.limit) || 0;
      const nip = req.query.nip;
      let result = [];

      // get user_id
      const user = await User.findOne({ 
        where: { nip }
      });
      if (!user) return sendResponse(404, "User is not found", res);

      if (lastID < 1) {
        const results = await Attendance.findAll({
          where: {
            user_id: user.id,
          },
          attributes: {
            exclude: ['user_id']
          },
          limit: limit,
          order: [
            ['id', 'DESC']
          ]
        })
        result = results
      } else {
        const results = await Attendance.findAll({
          where: {
            id: {
              [Op.lt]: lastID
            },
            user_id: user.id
          },
          attributes: {
            exclude: ['user_id']
          },
          limit: limit,
          order: [
            ['id', 'DESC']
          ]
        })
        result = results
      }
      
      const payload = {
        datas: result,
        lastID: result.length ? result[result.length - 1].id : 0,
        hasMore: result.length >= limit ? true : false
      };
      sendData(200, payload, "Success get user attendances data", res)
    } 
    catch (err) {
        next(err)
    };
  };
};

module.exports = AttendanceController;