const { Office, Office_Phone, Phone } = require('../models');
const { sendResponse, sendData } = require('../helpers/response.js');
const { Op } = require('sequelize');

class OfficeController {
  static async create(req, res, next) {
    const officeData = {
      name: req.body.name, 
      description: req.body.description,
      slug: req.body.slug,
      is_active: req.body.is_active
    };
    try {
      const office = await Office.findOne({ 
        where: { 
          slug: officeData.slug
        } 
      });
      if (!Boolean(office)) {
        const newOffice = await Office.create(officeData);
        const { id, name, description, slug } = newOffice;
        sendData(201, { id, name, description, slug }, "Success create office", res);  
      } else {
        sendResponse(400, 'Office already exist', res);
      }
    }
    catch (err) {
      next(err)
    };
  };

  static async getAllOffices(req, res, next) {
    try {
        const offices = await Office.findAll({
          attributes: {
            exclude: ['id']
          },
          order: [['name', 'asc']]
        });
        sendData(200, offices, "Success get all offices", res);
    } 
    catch (err) {
        next(err)
    };
  };

  static async getOffice(req, res, next) {
    const slug = req.params.slug
    try {
        const office = await Office.findOne({
            where: { slug },
            attributes:['name', 'description', 'slug', 'is_active'],
            include: {
              model: Office_Phone,
              attributes:['phone_id'],
              include: {
                model: Phone,
                attributes:['code', 'phone_number', 'is_main']
              }
            }
        })
        if (!office) return sendResponse(404, "Office is not found", res)
        sendData(200, office, "Success get office data", res)
    } 
    catch (err) {
        next(err)
    }
  }

  static async toggleOffice(req, res, next) {
    const slug = req.params.slug
    let officeData = {
      is_active: false
    };
    try {
      const office = await Office.findOne({
        where: { slug }
      })
      if (!office) return sendResponse(404, "Office is not found", res)
      if (office.is_active == false) {
        officeData.is_active = true
      }
      const updated = await Office.update(officeData, {
        where: { slug },
        returning: true
      })
      sendResponse(200, "Success update office", res)
    }
    catch (err) {
      next(err)
    }
  };

  static async update(req, res, next) {
    const currentSlug = req.params.slug
    const officeData = {
      name: req.body.name,
      slug: req.body.slug,
      description: req.body.description,
      is_active: req.body.is_active
    };
    try {
      const office = await Office.findOne({
        where: { slug: currentSlug }
      })
      if (!office) return sendResponse(404, "Office is not found", res)
      const officeWithNewSlug = await Office.findOne({
        where: { 
          [Op.and]: [
            { 
              id: {
                [Op.ne]: office.id, 
              } 
            },
            { slug: officeData.slug }
        ]
          }
      })
      if (officeWithNewSlug) return sendResponse(403, "Slug already used", res)
      const updated = await Office.update(officeData, {
        where: { id: office.id },
        returning: true
      })
      sendResponse(200, "Success update office", res)
    }
    catch (err) {
      next(err)
    }
    
  };
};

module.exports = OfficeController;