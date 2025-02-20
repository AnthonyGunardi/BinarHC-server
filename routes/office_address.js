const route = require('express').Router();
const { OfficeAddressController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/:slug', authentication, adminAuthorization, OfficeAddressController.create);
route.get('/:slug', authentication, OfficeAddressController.getAddresses);
route.put('/:id', authentication, adminAuthorization, OfficeAddressController.update);
route.delete('/:id', authentication, adminAuthorization, OfficeAddressController.delete);

module.exports = route;