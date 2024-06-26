const route = require('express').Router();
const { OfficeAddressController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/:slug', authentication, OfficeAddressController.getAddresses);
route.post('/:slug', authentication, OfficeAddressController.create);
route.put('/:id', authentication, OfficeAddressController.update);
route.delete('/:id', authentication, OfficeAddressController.delete);

module.exports = route;