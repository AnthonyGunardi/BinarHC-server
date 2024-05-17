const route = require('express').Router();
const { UserAddressController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/:nip', authentication, UserAddressController.getAddresses);
route.post('/:nip', authentication, UserAddressController.create);
route.put('/:id', authentication, UserAddressController.update);
route.delete('/:id', authentication, UserAddressController.delete);

module.exports = route;