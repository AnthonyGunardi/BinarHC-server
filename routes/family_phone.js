const route = require('express').Router();
const { FamilyPhoneController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/:id', authentication, FamilyPhoneController.getPhones);
route.post('/:id', authentication, FamilyPhoneController.create);
route.put('/:id', authentication, FamilyPhoneController.update);

module.exports = route;