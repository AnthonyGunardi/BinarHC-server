const route = require('express').Router();
const { OfficeController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/', authentication, adminAuthorization, OfficeController.create);
route.get('/', authentication, adminAuthorization, OfficeController.getAllOffices);
route.get('/:slug', authentication, OfficeController.getOffice);
route.put('/toggle/:slug', authentication, adminAuthorization, OfficeController.toggleOffice);
route.put('/:slug', authentication, adminAuthorization, OfficeController.update);

module.exports = route;