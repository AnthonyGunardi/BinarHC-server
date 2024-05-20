const route = require('express').Router();
const { OfficePhoneController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/:slug', authentication, OfficePhoneController.getPhones);
route.post('/:slug', authentication, OfficePhoneController.create);
route.put('/:id', authentication, OfficePhoneController.update);
route.delete('/:id', authentication, OfficePhoneController.delete);

module.exports = route;