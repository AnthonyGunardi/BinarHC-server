const route = require('express').Router();
const { EmploymentStatusController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.post('/', authentication, EmploymentStatusController.create);
route.get('/', authentication, EmploymentStatusController.getAllStatuses);
route.get('/:id', authentication, EmploymentStatusController.getStatus);
route.put('/toggle/:id', authentication, EmploymentStatusController.toggleStatus);
route.delete('/:id', authentication, EmploymentStatusController.delete);

module.exports = route;