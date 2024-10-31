const route = require('express').Router();
const { OfficeAddressController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.post('/:slug', authentication, OfficeAddressController.create);
route.get('/:slug', authentication, OfficeAddressController.getAddresses);
route.put('/:id', authentication, OfficeAddressController.update);
route.delete('/:id', authentication, OfficeAddressController.delete);

module.exports = route;