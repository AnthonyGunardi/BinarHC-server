const route = require('express').Router();
const { InformationController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/', authentication, adminAuthorization, InformationController.create);
route.get('/', authentication, InformationController.getAllInformations);
route.get('/type/:type', authentication, InformationController.getInformationByType);
route.get('/:id', authentication, InformationController.getInformation);
route.put('/:id', authentication, adminAuthorization, InformationController.update);
route.delete('/:id', authentication, adminAuthorization, InformationController.delete);

module.exports = route;