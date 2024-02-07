const { Office } = require('../models');

class OfficeController {
  static async create(req, res, next) {
    const officeData = {
      name: req.body.name, 
      description: req.body.description
    };
    try {
      const office = await Office.findOne({ where: { name: userData.name } });
      if (!Boolean(office)) {
        const newOffice = await Office.create(officeData);
        const { id, name, description } = newOffice;
        res.status(201).json({ id, name, description, message: 'Office is created' });
      } else {
        res.status(400).json({ message: 'Office already exist' });
      }
    }
    catch (err) {
      next(err)
    };
  };

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