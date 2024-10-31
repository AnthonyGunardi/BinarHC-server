const route = require('express').Router();
const { OfficeController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.post('/', authentication, OfficeController.create);
route.get('/', authentication, OfficeController.getAllOffices);
route.get('/:slug', authentication, OfficeController.getOffice);
route.put('/toggle/:slug', authentication, OfficeController.toggleOffice);
route.put('/:slug', authentication, OfficeController.update);

module.exports = route;