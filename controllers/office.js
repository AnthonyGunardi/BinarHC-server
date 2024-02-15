const { Office } = require('../models');
const { sendResponse, sendData } = require('../helpers/response.js');

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
        sendData(201, { id, name, description, slug }, "Office is created", res);  
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
          attributes:['name', 'description', 'slug', 'is_active'],
          order: [['name', 'asc']]
        });
        sendData(200, offices, "Success get all offices", res);
    } catch (err) {
        next(err)
    };
  };

  static async getOffice(req, res, next) {
    try {
        const office = await Office.findOne({
            where: {
                slug: req.params.slug,
            }
        })
        if (!office) return sendResponse(404, "Office is not found", res)
        sendData(200, office, "Success get office data", res)
    } catch (err) {
        next(err)
    }
  }

  static async update(req, res, next) {
    const id = req.params.id
    try {
      const officeData = {
        name: req.body.name, 
        description: req.body.description
      };
      const user = await Office.update(officeData, {
        where: { id },
        returning: true
      })
      res.status(200).json({ message: 'Office is updated'})
  }
    catch (err) {
      next(err)
    }
  };
};

module.exports = OfficeController;