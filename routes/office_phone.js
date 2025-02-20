const route = require('express').Router();
const { OfficePhoneController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/:slug', authentication, adminAuthorization, OfficePhoneController.create);
route.get('/:slug', authentication, OfficePhoneController.getPhones);
route.put('/:id', authentication, adminAuthorization, OfficePhoneController.update);
route.delete('/:id', authentication, adminAuthorization, OfficePhoneController.delete);

module.exports = route;