const route = require('express').Router();
const { FamilyController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.post('/:nip', authentication, FamilyController.create);
route.get('/birthday', authentication, FamilyController.findBirthdayFamilies);
route.get('/:nip', authentication, FamilyController.getFamilies);
route.put('/:id', authentication, FamilyController.update);
route.delete('/:id', authentication, FamilyController.delete);

module.exports = route;