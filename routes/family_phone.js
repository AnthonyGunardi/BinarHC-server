const route = require('express').Router();
const { FamilyPhoneController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.post('/:id', authentication, FamilyPhoneController.create);
route.get('/employee/:nip', authentication, FamilyPhoneController.getPhonesByNip);
route.get('/:id', authentication, FamilyPhoneController.getPhones);
route.put('/:id', authentication, FamilyPhoneController.update);
route.delete('/:id', authentication, FamilyPhoneController.delete);

module.exports = route;