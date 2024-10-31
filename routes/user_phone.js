const route = require('express').Router();
const { UserPhoneController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.post('/:nip', authentication, UserPhoneController.create);
route.get('/:nip', authentication, UserPhoneController.getPhones);
route.put('/:id', authentication, UserPhoneController.update);
route.delete('/:id', authentication, UserPhoneController.delete);

module.exports = route;