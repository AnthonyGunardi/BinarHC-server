const route = require('express').Router();
const { EmploymentStatusController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/', authentication, adminAuthorization,EmploymentStatusController.create);
route.get('/', authentication, adminAuthorization, EmploymentStatusController.getAllStatuses);
route.get('/:id', authentication, EmploymentStatusController.getStatus);
route.put('/toggle/:id', authentication, adminAuthorization, EmploymentStatusController.toggleStatus);
route.put('/:id', authentication, adminAuthorization,EmploymentStatusController.update);
route.delete('/:id', authentication, adminAuthorization,EmploymentStatusController.delete);

module.exports = route;