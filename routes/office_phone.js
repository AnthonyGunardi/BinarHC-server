const route = require('express').Router();
const { OfficePhoneController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.post('/:slug', authentication, OfficePhoneController.create);
route.get('/:slug', authentication, OfficePhoneController.getPhones);
route.put('/:id', authentication, OfficePhoneController.update);
route.delete('/:id', authentication, OfficePhoneController.delete);

module.exports = route;