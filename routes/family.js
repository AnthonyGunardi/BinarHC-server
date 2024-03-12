const route = require('express').Router();
const { FamilyController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/:nip', authentication, FamilyController.getFamilies);
route.post('/:nip', authentication, FamilyController.create);
route.put('/:id', authentication, FamilyController.update);

module.exports = route;