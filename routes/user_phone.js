const route = require('express').Router();
const { UserPhoneController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/:nip', authentication, UserPhoneController.getPhones);
route.post('/:nip', authentication, UserPhoneController.create);
route.put('/:id', authentication, UserPhoneController.update);

module.exports = route;