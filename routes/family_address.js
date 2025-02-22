const route = require('express').Router();
const { FamilyAddressController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.post('/:id', authentication, FamilyAddressController.create);
route.get('/employee/:nip', authentication, FamilyAddressController.getAddressesByNip);
route.get('/:id', authentication, FamilyAddressController.getAddresses);
route.put('/:id', authentication, FamilyAddressController.update);
route.delete('/:id', authentication, FamilyAddressController.delete);

module.exports = route;