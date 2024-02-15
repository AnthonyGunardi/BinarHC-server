const route = require('express').Router();
const { OfficeController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', authentication, OfficeController.getAllOffices);
route.post('/', authentication, OfficeController.create);
route.get('/:slug', authentication, OfficeController.getOffice);

module.exports = route;