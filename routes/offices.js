const route = require('express').Router();
const { OfficeController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', authentication, OfficeController.getAllOffices);
route.post('/', authentication, OfficeController.create);
route.get('/:slug', authentication, OfficeController.getOffice);
route.put('/:slug', authentication, OfficeController.update);
route.put('/toggle/:slug', authentication, OfficeController.toggleOffice);

module.exports = route;